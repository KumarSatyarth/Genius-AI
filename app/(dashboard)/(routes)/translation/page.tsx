"use client";

import * as z from "zod";
const axios = require("axios").default;
import { ArrowLeftRight } from "lucide-react";
import { useForm } from "react-hook-form"; 
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Heading } from "@/components/heading";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

const languages = [
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "da", label: "Danish" },
  { value: "nl", label: "Dutch" },
  { value: "fi", label: "Finnish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "el", label: "Greek" },
  { value: "he", label: "Hebrew" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "la", label: "Latin" },
  { value: "pl", label: "Polish" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "sv", label: "Swedish" },
  { value: "tr", label: "Turkish" },
];

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  language: z.string().min(1, "Language is required"),
});

type Message = {
  role: "user" | "bot";
  content: string;
};

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      language: languages[0].value,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Add user message to state
      const userMessage: Message = { 
        role: "user", 
        content: values.prompt 
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // API call and response handling
      const options = {
        method: "POST",
        url: "https://api.edenai.run/v2/translation/automatic_translation",
        headers: {
          authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        data: {
          providers: "microsoft",
          text: values.prompt,
          source_language: "en",
          target_language: values.language,
        },
      };

      const response = await axios.request(options);
      console.log(response);
      const generatedText = response.data.microsoft.text;

      // Add bot message to state
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
        title="Translation"
        description="Seamlessly convert your text into multiple languages with our state-of-the-art translation engine."
        icon={ArrowLeftRight}
        iconColor="text-emerald-500"
        bgcolor="bg-emerald-500/10"
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
                  <FormItem className="col-span-12 lg:col-span-8">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading} 
                        placeholder="Hello, how are you?" 
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="language"
                render={({ field }) => (
                  <FormItem className="col-span-6 lg:col-span-2">
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-6 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
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
                      <div>{message.content}</div>
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
