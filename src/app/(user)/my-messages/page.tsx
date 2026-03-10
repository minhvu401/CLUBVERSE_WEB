import { Suspense } from "react";
import MyMessagesContent from "./MyMessagesContent";

export default function MyMessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyMessagesContent />
    </Suspense>
  );
}
