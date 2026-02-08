import { Button } from "@workspace/ui/components/button"
import { add } from "@workspace/math/add"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World/web</h1>
        <div className="flex gap-2">
          <Button>Button</Button>
          <Button variant="outline">Outline</Button>
          <p>{add(1, 2)}</p>
        </div>
      </div>
    </div>
  )
}
