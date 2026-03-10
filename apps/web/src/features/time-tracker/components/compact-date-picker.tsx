import { CalendarIcon } from "lucide-react";
import { Button } from "@open-learn/ui/components/button";
import { Input } from "@open-learn/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@open-learn/ui/components/popover";

interface CompactDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function CompactDatePicker({ value, onChange, label }: CompactDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className="h-10 justify-start border-0 px-3">
          <CalendarIcon data-icon="inline-start" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <PopoverHeader>
          <PopoverTitle>Date</PopoverTitle>
          <PopoverDescription>Choose the day this activity happened.</PopoverDescription>
        </PopoverHeader>
        <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
      </PopoverContent>
    </Popover>
  );
}
