"use client";

import { memo, useState } from "react";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils/cn";
import type { TemplateVariable } from "@/types";

// ================================
// Single Variable Editor
// ================================

interface VariableEditorProps {
  variable: TemplateVariable;
  index: number;
  onChange: (index: number, variable: Partial<TemplateVariable>) => void;
  onRemove: (index: number) => void;
  isInContent: boolean;
}

function VariableEditorComponent({
  variable,
  index,
  onChange,
  onRemove,
  isInContent,
}: VariableEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("border", !isInContent && "border-orange-300 bg-orange-50/50")}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-mono">
                  {`{{${variable.name}}}`}
                </Button>
              </CollapsibleTrigger>
              {variable.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {!isInContent && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not in content
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`var-name-${index}`}>Variable Name</Label>
                <Input
                  id={`var-name-${index}`}
                  value={variable.name}
                  onChange={(e) =>
                    onChange(index, { name: e.target.value.replace(/\s/g, "_") })
                  }
                  placeholder="variableName"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`var-default-${index}`}>Default Value</Label>
                <Input
                  id={`var-default-${index}`}
                  value={variable.defaultValue ?? ""}
                  onChange={(e) =>
                    onChange(index, { defaultValue: e.target.value || undefined })
                  }
                  placeholder="Optional default"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`var-desc-${index}`}>Description</Label>
              <Textarea
                id={`var-desc-${index}`}
                value={variable.description}
                onChange={(e) => onChange(index, { description: e.target.value })}
                placeholder="Help users understand what this variable is for"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id={`var-required-${index}`}
                checked={variable.required}
                onCheckedChange={(checked) => onChange(index, { required: checked })}
              />
              <Label htmlFor={`var-required-${index}`} className="cursor-pointer">
                Required field
              </Label>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

const VariableEditor = memo(VariableEditorComponent);

// ================================
// Variable List Manager
// ================================

interface VariableListProps {
  variables: TemplateVariable[];
  parsedVariables: string[];
  onChange: (index: number, variable: Partial<TemplateVariable>) => void;
  onAdd: (variable: TemplateVariable) => void;
  onRemove: (index: number) => void;
  onSync: () => void;
}

export function VariableList({
  variables,
  parsedVariables,
  onChange,
  onAdd,
  onRemove,
  onSync,
}: VariableListProps) {
  const [newVarName, setNewVarName] = useState("");

  const handleAddVariable = () => {
    if (!newVarName.trim()) return;

    const sanitizedName = newVarName.trim().replace(/\s/g, "_");

    if (variables.some((v) => v.name === sanitizedName)) {
      return; // Already exists
    }

    onAdd({
      name: sanitizedName,
      description: "",
      required: true,
      defaultValue: undefined,
    });

    setNewVarName("");
  };

  // Check which variables are in content
  const variablesInContent = new Set(parsedVariables);

  // Find variables in content that don't have definitions
  const undefinedVariables = parsedVariables.filter(
    (v) => !variables.some((def) => def.name === v)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Template Variables</h3>
          <p className="text-xs text-muted-foreground">
            Define the variables used in your template
          </p>
        </div>
        {undefinedVariables.length > 0 && (
          <Button variant="outline" size="sm" onClick={onSync}>
            Sync from content ({undefinedVariables.length})
          </Button>
        )}
      </div>

      {/* Warning for undefined variables */}
      {undefinedVariables.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Variables found in content
            </CardTitle>
            <CardDescription className="text-orange-600">
              These variables are used in your template but not defined:
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="flex flex-wrap gap-1">
              {undefinedVariables.map((name) => (
                <Badge key={name} variant="outline" className="font-mono border-orange-300">
                  {`{{${name}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variable list */}
      <div className="space-y-2">
        {variables.map((variable, index) => (
          <VariableEditor
            key={`${variable.name}-${index}`}
            variable={variable}
            index={index}
            onChange={onChange}
            onRemove={onRemove}
            isInContent={variablesInContent.has(variable.name)}
          />
        ))}
      </div>

      {/* Add new variable */}
      <div className="flex items-center gap-2 pt-2">
        <Input
          value={newVarName}
          onChange={(e) => setNewVarName(e.target.value)}
          placeholder="New variable name"
          className="flex-1 font-mono"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddVariable();
            }
          }}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleAddVariable}
          disabled={!newVarName.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ================================
// Variable Input Form (for using templates)
// ================================

interface VariableInputFormProps {
  variables: TemplateVariable[];
  values: Record<string, string>;
  exampleValues?: Record<string, string>;
  onChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function VariableInputForm({
  variables,
  values,
  exampleValues = {},
  onChange,
  errors = {},
  disabled = false,
}: VariableInputFormProps) {
  if (variables.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        This template has no variables to fill.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variables.map((variable) => {
        const hasError = !!errors[variable.name];
        const placeholder =
          exampleValues[variable.name] ||
          variable.defaultValue ||
          `Enter ${variable.name}`;

        return (
          <div key={variable.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor={`input-${variable.name}`}
                className={cn(hasError && "text-destructive")}
              >
                {variable.name}
                {variable.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {variable.defaultValue && !values[variable.name] && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onChange(variable.name, variable.defaultValue!)}
                  disabled={disabled}
                >
                  Use default
                </Button>
              )}
            </div>
            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}
            <Textarea
              id={`input-${variable.name}`}
              value={values[variable.name] ?? ""}
              onChange={(e) => onChange(variable.name, e.target.value)}
              placeholder={placeholder}
              rows={2}
              className={cn(
                "resize-none",
                hasError && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={disabled}
            />
            {hasError && (
              <p className="text-xs text-destructive">{errors[variable.name]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
