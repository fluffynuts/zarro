import { noop } from "./noop";
const { spyOn } = jest;
export function spyOnConsole(outputs?: string[]) {
  const out = outputs ?? [ "debug", "info", "log", "warn", "error" ];
  for (const k of out) {
    spyOn(console, k as any).mockImplementation(noop);
  }
}
