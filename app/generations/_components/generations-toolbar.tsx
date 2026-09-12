"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { generationsSearchParams } from "../_state/params";

export function GenerationsToolbar() {
  const [query, setQuery] = useQueryState(
    "query",
    generationsSearchParams.query,
  );
  const [localQuery, setLocalQuery] = useState(query);

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300,
  );

  return (
    <InputGroup className="h-12 max-w-md rounded-lg">
      <InputGroupAddon className="pl-4">
        <Search className="size-4.5" />
      </InputGroupAddon>
      <InputGroupInput
        placeholder="Search generations..."
        className="text-base"
        value={localQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setLocalQuery(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
      />
    </InputGroup>
  );
}
