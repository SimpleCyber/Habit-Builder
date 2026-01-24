"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0f13]">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">H</span>
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HabitX
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering you to build lasting habits and achieve your full
              potential.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://chromewebstore.google.com"
                    target="_blank"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Chrome Extension
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Legal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-12 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} HabitX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
