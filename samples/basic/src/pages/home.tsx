import Editor from "@monaco-editor/react";
import { ArtifactViewer } from "@centralmind/artifacts";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RefreshCcw, Hammer } from "lucide-react";

export function HomePage() {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen w-full">
      <div>
        <div className="p-4 grid grid-cols-[1fr_auto_1fr] gap-2">
          <div className="flex justify-start align-middle gap-1">
            <Button>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button>
              <Hammer className="h-4 w-4" />
              &nbsp; Build
            </Button>
          </div>
          <div className="flex justify-center align-middle">
            <Select>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a sample" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end align-middle">
            <Button>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Separator className="my-0" />
      </div>
      <div>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="flex h-full items-center justify-center">
              <Editor
                width="100%"
                height="100%"
                defaultLanguage="typescript"
                options={{ minimap: { enabled: false } }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="flex h-full items-center justify-center">
              <ArtifactViewer files={{}} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
