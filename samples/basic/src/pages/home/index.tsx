import { Separator } from "@/components/ui/separator";
import { Header } from "./header";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export function HomePage() {
  return (
    <>
      <Header />
      <Separator className="my-4" />
      <ResizablePanelGroup direction="horizontal" className="min-h-[200px] max-w-md">
        <ResizablePanel defaultSize={25}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Sidebar</span>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Content</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
