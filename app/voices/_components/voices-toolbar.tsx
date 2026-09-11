"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { voicesSearchParams } from "../_state/params";
import { VoiceCreateDialog } from "./voice-create-dialog";

export function VoicesToolbar() {
  const [query, setQuery] = useQueryState("query", voicesSearchParams.query);
  const [localQuery, setLocalQuery] = useState(query);

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300,
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="h-12 w-full rounded-lg sm:flex-1">
        <InputGroupAddon className="pl-4">
          <Search className="size-4.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Search voices..."
          className="text-base"
          value={localQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalQuery(e.target.value);
            debouncedSetQuery(e.target.value);
          }}
        />
      </InputGroup>

      <VoiceCreateDialog>
        <Button
          size="lg"
          className="w-full cursor-pointer border-0 bg-sonic text-background transition-transform hover:scale-[1.02] sm:w-auto sm:shrink-0"
        >
          <Sparkles className="size-4" />
          Custom voice
        </Button>
      </VoiceCreateDialog>
    </div>
  );
}
