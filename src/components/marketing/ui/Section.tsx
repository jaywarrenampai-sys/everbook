import { cn } from "@/lib/cn";
import Container from "./Container";

interface Props {
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** background tone */
  tone?: "cream" | "sand" | "mist" | "espresso";
  /** disable the inner container (for full-bleed sections) */
  bleed?: boolean;
}

const TONES: Record<string, string> = {
  cream: "bg-cream",
  sand: "bg-sand",
  mist: "bg-mist",
  espresso: "bg-espresso text-cream",
};

export default function Section({
  id,
  children,
  className,
  tone = "cream",
  bleed = false,
}: Props) {
  return (
    <section
      id={id}
      className={cn("py-20 md:py-28 lg:py-32", TONES[tone], className)}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
