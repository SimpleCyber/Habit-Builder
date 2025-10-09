import { Suspense } from "react";



export default function Loading() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
   </Suspense>
  );
}
