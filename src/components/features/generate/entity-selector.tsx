"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

interface EntitySelectorProps<T extends { id: string; name: string }> {
  label: string;
  placeholder: string;
  entities: T[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isLoading?: boolean;
  required?: boolean;
  description?: string;
  emptyMessage?: string;
  renderPreview?: (entity: T) => React.ReactNode;
  disabled?: boolean;
}

export function EntitySelector<T extends { id: string; name: string }>({
  label,
  placeholder,
  entities,
  value,
  onChange,
  isLoading = false,
  required = false,
  description,
  emptyMessage = "No items available",
  renderPreview,
  disabled = false,
}: EntitySelectorProps<T>) {
  const selectedEntity = entities.find((e) => e.id === value);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const handleValueChange = (newValue: string) => {
    // Handle "none" selection for optional fields
    if (newValue === "__none__") {
      onChange(undefined);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={`select-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Select
        value={value || "__none__"}
        onValueChange={handleValueChange}
        disabled={disabled || entities.length === 0}
      >
        <SelectTrigger
          id={`select-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="__none__">
              <span className="text-muted-foreground">None</span>
            </SelectItem>
          )}
          {entities.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedEntity && renderPreview && (
        <div className="mt-2 rounded-md border bg-muted/50 p-3">
          {renderPreview(selectedEntity)}
        </div>
      )}
    </div>
  );
}
