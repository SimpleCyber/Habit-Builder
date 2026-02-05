"use client";

import { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  getDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState("");

  const log = (msg: string) => setLogs((prev) => [...prev, msg]);

  const runMigration = async () => {
    setLoading(true);
    setLogs([]);
    try {
      log("Starting migration...");

      // 1. Fetch all users
      const usersSnap = await getDocs(collection(db, "users"));
      const userIds = usersSnap.docs.map((d) => d.id);
      log(`Found ${userIds.length} users.`);

      let totalConverted = 0;

      for (const userId of userIds) {
        log(`Processing user: ${userId}`);

        // Get Tasks
        const tasksSnap = await getDocs(
          collection(db, "users", userId, "tasks"),
        );

        for (const taskDoc of tasksSnap.docs) {
          const taskId = taskDoc.id;

          // Get History
          const historySnap = await getDocs(
            collection(db, "users", userId, "tasks", taskId, "history"),
          );

          for (const histDoc of historySnap.docs) {
            const data = histDoc.data();
            if (data.photo && data.photo.startsWith("data:image")) {
              log(
                `  Converting photo for task ${taskId}, history ${histDoc.id}...`,
              );

              try {
                // Upload to Cloudinary via our API
                const res = await fetch("/api/cloudinary/upload", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image: data.photo }),
                });

                if (!res.ok) throw new Error("Upload failed");

                const json = await res.json();
                const newUrl = json.url;

                // Update Firestore
                await updateDoc(
                  doc(
                    db,
                    "users",
                    userId,
                    "tasks",
                    taskId,
                    "history",
                    histDoc.id,
                  ),
                  {
                    photo: newUrl,
                  },
                );

                log(`    -> Success: ${newUrl}`);
                totalConverted++;
              } catch (err) {
                console.error(err);
                log(`    -> FAILED: ${err}`);
              }
            }
          }
        }
      }

      log(`Migration complete. Converted ${totalConverted} images.`);
      toast.success("Migration complete!");
    } catch (err: any) {
      console.error(err);
      log(`Error: ${err.message}`);
      toast.error("Migration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Migration Admin</h1>
      <Button onClick={runMigration} disabled={loading}>
        {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        Run Base64 to Cloudinary Migration
      </Button>

      <div className="mt-6 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        {logs.length === 0 && (
          <span className="text-muted-foreground">
            Logs will appear here...
          </span>
        )}
      </div>
    </div>
  );
}
