// FR-6: The system shall display an RSVP submission page.
// 5.1.4: RSVP Customization

"use client";

import * as React from "react";
import { X, Plus, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { RSVPCustomQuestion } from "@/types/event.types";

interface CustomQuestionsProps {
  value: RSVPCustomQuestion[];
  onChange: (questions: RSVPCustomQuestion[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

type QuestionType = "text" | "select" | "yes_no";

export function CustomQuestions({
  value = [],
  onChange,
  error,
  disabled = false,
  className,
}: CustomQuestionsProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleAddQuestion = () => {
    if (value.length >= 5) return;

    const newQuestion: RSVPCustomQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: "",
      type: "text",
      required: false,
      order: value.length,
    };

    onChange([...value, newQuestion]);
    setExpandedId(newQuestion.id);
  };

  const handleRemoveQuestion = (id: string) => {
    const newQuestions = value
      .filter((q) => q.id !== id)
      .map((q, index) => ({ ...q, order: index }));
    onChange(newQuestions);
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const handleUpdateQuestion = (
    id: string,
    updates: Partial<RSVPCustomQuestion>
  ) => {
    const newQuestions = value.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    );
    onChange(newQuestions);
  };

  const handleMoveQuestion = (id: string, direction: "up" | "down") => {
    const index = value.findIndex((q) => q.id === id);
    if (index === -1) return;

    const newQuestions = [...value];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length)
      return; // Swap questions
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Update order
    const reorderedQuestions = newQuestions.map((q, i) => ({ ...q, order: i }));
    onChange(reorderedQuestions);
  };

  const handleAddOption = (questionId: string) => {
    const question = value.find((q) => q.id === questionId);
    if (!question || question.type !== "select") return;

    const options = question.options || [];
    if (options.length >= 20) return;

    handleUpdateQuestion(questionId, {
      options: [...options, ""],
    });
  };

  const handleUpdateOption = (
    questionId: string,
    optionIndex: number,
    newValue: string
  ) => {
    const question = value.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = newValue;

    handleUpdateQuestion(questionId, {
      options: newOptions,
    });
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    const question = value.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    handleUpdateQuestion(questionId, {
      options: newOptions.length > 0 ? newOptions : undefined,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Custom Questions {value.length > 0 && `(${value.length}/5)`}
        </label>

        {/* Questions List */}
        {value.length > 0 && (
          <div className="space-y-3 mb-3">
            {value.map((question, index) => {
              const isExpanded = expandedId === question.id;

              return (
                <Card key={question.id} className="p-4">
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1 mt-2">
                        <button
                          type="button"
                          onClick={() => handleMoveQuestion(question.id, "up")}
                          disabled={disabled || index === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleMoveQuestion(question.id, "down")
                          }
                          disabled={disabled || index === value.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <Input
                          type="text"
                          placeholder="Enter your question..."
                          value={question.question}
                          onChange={(e) =>
                            handleUpdateQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          disabled={disabled}
                          maxLength={500}
                        />

                        <div className="flex flex-wrap gap-3 items-center">
                          {/* Question Type */}
                          <select
                            value={question.type}
                            onChange={(e) => {
                              const newType = e.target.value as QuestionType;
                              handleUpdateQuestion(question.id, {
                                type: newType,
                                options:
                                  newType === "select" ? [""] : undefined,
                              });
                            }}
                            disabled={disabled}
                            className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="text">Text Answer</option>
                            <option value="select">Multiple Choice</option>
                            <option value="yes_no">Yes/No</option>
                          </select>

                          {/* Required Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) =>
                                handleUpdateQuestion(question.id, {
                                  required: e.target.checked,
                                })
                              }
                              disabled={disabled}
                              className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-sm text-muted-foreground">
                              Required
                            </span>
                          </label>
                        </div>

                        {/* Options for Select Type */}
                        {question.type === "select" && (
                          <div className="space-y-2 pl-4 border-l-2 border-border">
                            <p className="text-xs text-muted-foreground">
                              Options:
                            </p>
                            {(question.options || []).map(
                              (option, optIndex) => (
                                <div key={optIndex} className="flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      handleUpdateOption(
                                        question.id,
                                        optIndex,
                                        e.target.value
                                      )
                                    }
                                    disabled={disabled}
                                    maxLength={100}
                                    className="flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveOption(question.id, optIndex)
                                    }
                                    disabled={disabled}
                                    className="text-destructive hover:text-destructive/80 transition-colors"
                                    aria-label="Remove option"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )
                            )}
                            {(question.options?.length || 0) < 20 && (
                              <Button
                                type="button"
                                onClick={() => handleAddOption(question.id)}
                                disabled={disabled}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Option
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive/80 transition-colors mt-2"
                        aria-label="Remove question"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Question Button */}
        {!disabled && value.length < 5 && (
          <Button
            type="button"
            onClick={handleAddQuestion}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Question
          </Button>
        )}

        {value.length >= 5 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Maximum of 5 custom questions reached
          </p>
        )}

        {error && value.length === 0 && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Add custom questions for guests to answer when they RSVP. Questions can
        be text answers, multiple choice, or yes/no.
      </p>
    </div>
  );
}
