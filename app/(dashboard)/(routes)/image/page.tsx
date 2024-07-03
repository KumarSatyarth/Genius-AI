/* eslint-disable @next/next/no-img-element */
"use client";
import * as z from "zod";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Heading } from "@/components/heading";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import axios from "axios";

// Type definition for Message
type Message = {
  role: "bot";
  content: string; // Keep as string to handle Base64 data
};

// Component to display a Base64 image with a download button
const Base64ImageWithDownload = ({ base64String, altText }: { base64String: string; altText: string }) => {
  // Function to open the image in a new tab
  const handleOpenImage = useCallback(() => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="data:image/png;base64,${base64String}" alt="${altText}" style="max-width: 100%; height: auto;" />`);
    } else {
      alert("Failed to open image. Please allow pop-ups and try again.");
    }
  }, [base64String, altText]);

  return (
    <div className="flex flex-col items-center">
      <img src={`data:image/png;base64,${base64String}`} alt={altText} className="w-64 h-64 object-contain mb-2" />
      <Button 
        onClick={handleOpenImage}
        variant="secondary"
        className="mt-2"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Image
      </Button>
    </div>
  );
};

const ImagePage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setMessages([]);

    try {
      const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/image/generation",
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        data: {
          providers: "openai",
          text: values.prompt,
          resolution: "1024x1024"
        },
      };

      const response = await axios.request(options);
      const generatedText = response.data.openai.items[0].image;

      const botMessage: Message = {
        role: "bot",
        content: generatedText
      };
      setMessages([botMessage]);

      form.reset();
    } catch (error) {
      console.error("Failed to submit message:", error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  }, [form, router]);

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Transform Your Words into Stunning Images"
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgcolor="bg-pink-700/10"
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
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Draw a little girl riding a Pegasus"
                      {...field}
                      autoComplete="off"
                    />
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-2 mt-4">
          {isLoading ? (
            <div className="p-4 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <Empty label="No Image Generated" />
              )}
              <div className="flex flex-col-reverse gap-y-2">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm">
                    <div className={cn(
                      "p-4 w-full flex items-center justify-center rounded-lg",  // Center align the image
                      "bg-muted"
                    )}>
                      <Base64ImageWithDownload base64String={message.content} altText="Generated Image" />
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

export default ImagePage;
