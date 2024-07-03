/* eslint-disable @next/next/no-img-element */
"use client";

import * as z from "zod";
import axios from "axios";
import { Aperture, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Heading } from "@/components/heading";
import { formSchema } from "./constants";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

// Define the props type for Base64ImageWithDownload
interface Base64ImageWithDownloadProps {
  base64String: string;
  altText: string;
}

// Base64ImageWithDownload Component
const Base64ImageWithDownload: React.FC<Base64ImageWithDownloadProps> = ({ base64String, altText }) => {
  const handleOpenImage = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="data:image/png;base64,${base64String}" alt="${altText}" style="max-width: 100%; height: auto;" />`);
    } else {
      alert("Failed to open image. Please allow pop-ups and try again.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border rounded-lg overflow-hidden">
        <img src={`data:image/png;base64,${base64String}`} alt={altText} className="w-64 h-64 object-contain mb-2" />
      </div>
      <Button onClick={handleOpenImage} variant="secondary" className="mt-2">
        <Download className="h-4 w-4 mr-2" />
        Open Image
      </Button>
    </div>
  );
};

type Message = {
  role: "user" | "bot";
  content: string;
};

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Define form with fixed prompt value "Background removed from image"
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "Background removed from your image", // Fixed prompt value
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async () => {
    try {
      // Add user message to state
      const userMessage: Message = { 
        role: "user", 
        content: "Background removed from image"  // Fixed user message content
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Ensure a file has been selected
      if (!file) {
        console.error("No file selected. Please select a file and try again.");
        return;
      }

      // Create and append file to FormData
      const formData = new FormData();
      formData.append("providers", "microsoft"); // Specify provider
      formData.append("file", file);

      // API call and response handling
      const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/image/background_removal",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        data: formData,
      };

      const response = await axios.request(options);
      console.log(response);
      const generatedText = response.data.microsoft.image_b64; // Adjust based on actual response structure

      // Add bot message to state
      const botMessage: Message = {
        role: "bot",
        content: generatedText,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      form.reset();
      setFile(null); // Reset file input
    } catch (error: any) {
      console.error("Failed to submit message:", error);
      // Add toast errors here after configuring toast provider
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Background Removal"
        description="Remove unwanted background from your favorite photos."
        icon={Aperture}
        iconColor="text-orange-600"
        bgcolor="bg-orange-600/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
            >
              <FormItem className="col-span-12 lg:col-span-10">
                <FormControl className="m-0 p-0">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
              <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div>
                  <Empty label="No Image added" />
                </div>
              )}
              <div className="flex flex-col-reverse gap-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm">
                    <div className={cn(
                      "p-8 flex items-start gap-x-8 rounded-lg", 
                      message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                    )}>
                      {message.role === "user" ? (
                        <>
                          <UserAvatar />
                          <div>{message.content}</div>
                        </>
                      ) : (
                        <>
                          <BotAvatar />
                          <div className="flex items-center justify-center">
                            <Base64ImageWithDownload base64String={message.content} altText="Generated Image" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}  
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
