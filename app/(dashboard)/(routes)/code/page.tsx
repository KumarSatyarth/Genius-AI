"use client";

import * as z from "zod";
const axios = require("axios").default;
import { Code } from "lucide-react";
import { useForm } from "react-hook-form"; 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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

type Message = {
  role: "user" | "bot";
  content: string;
};

const CodePage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
        // Reset messages when a new prompt is submitted
        //setMessages([]);
        
        const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
  
      const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/text/code_generation",
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        data: {
          providers: "openai",
          prompt: "",
          instruction: values.prompt,  
          temperature: 0.2,
          max_tokens: 250,
        },
      };
  
      const response = await axios.request(options);
      const generatedText = response.data.openai.generated_text;
  
      const botMessage: Message = {
        role: "bot",
        content: generatedText,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
  
      form.reset();
    } catch (error: any) {
      console.error("Failed to submit message:", error);
    } finally {
      router.refresh();
    }
  };


  return (
    <div>
      <Heading
        title="Code"
        description="Compose Code Creations from Your Imagination"
        icon={Code}
        iconColor="text-green-700"
        bgcolor="bg-green-700/10"
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
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading} 
                        placeholder="Give an example of insertOne in mongoose" 
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                  <Empty label="No conversation started" />
                </div>
              )}
              <div className="flex flex-col-reverse gap-y-4">
                {messages.map((message, index) => (
                  <div key={index} className="text-sm">
                    <div className={cn(
                      "p-8 w-full flex items-start gap-x-8 rounded-lg", 
                      message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                    )}>
                      {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                      <ReactMarkdown
                        components={{
                            pre: ({node, ...props}) =>(
                                <div className="overflow-auto w-full my-2
                                bg-black/10 p-2 rounded-lg">
                                    <pre {...props} />
                                </div>
                            ),
                            code :({node, ...props}) => (
                                <code className="bg-black/10 rpunded-lg
                                p-1"{...props} />
                            )
                            }}
                        className="text-sm overflow-hidden leading-7"
                      >
                        {message.content || ""}
                    </ReactMarkdown>
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

export default CodePage;
