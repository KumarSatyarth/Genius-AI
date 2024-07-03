"use client"
import { MessageSquare, ArrowRight, ImageIcon, Aperture, ArrowLeftRight, Code} from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const tools =[
  {
    label: "Conversation",
    icon: MessageSquare,
    color: "text-violet-500",
    bgcolor: "bg-violet-500/10",
    href: "/conversation"
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    color: "text-pink-700",
    bgcolor: "bg-pink-700/10",
    href: "/image"
  },
  {
    label: "Background Removal ",
    icon:Aperture,
    color: "text-orange-600",
    bgcolor: "bg-orange-600/10",
    href: "/background"
  },
  {
    label: "Code Generaion",
    icon: Code,
    color: "text-green-700",
    bgcolor: "bg-green-700/10",
    href: "/code"
  },
  {
    label: "Translation",
    icon: ArrowLeftRight,
    color: "text-emerald-500",
    bgcolor: "bg-emerald-500/10",
    href: "/translation" 
  }
]
const DashboardPage = () => {
  const router = useRouter();
  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Explore the Power of AI 
        </h2>
        <p className="text-muted-forreground font-light 
        text-sm md:text-lg text-center">
          Chat with the Smartest AI - Experience the Power of AI
        </p>
      </div>
      <div className="px-4 md:px-20 lg:px-32 space-y-4">
        {tools.map((tool) => ( 
          <Card
            onClick={ () => router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center
            justify-between hover:shadow-md transition
            cursor-pointed">
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md",tool.bgcolor)}>
                <tool.icon className={cn("w-8 h-8",tool.color)} />
              </div>
              <div className="font-semibold">
                {tool.label}
              </div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;