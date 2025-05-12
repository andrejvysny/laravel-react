import * as React from "react";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface SmartFormProps<
  TFieldValues extends FieldValues,
  Schema extends z.ZodType<any, any>
> {
  schema: Schema;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: (methods: UseFormReturn<TFieldValues>) => React.ReactNode;
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
  formOptions?: Omit<UseFormProps<TFieldValues>, "defaultValues" | "resolver">;
}

export function SmartForm<
  TFieldValues extends FieldValues,
  Schema extends z.ZodType<any, any>
>({
  schema,
  defaultValues,
  onSubmit,
  children,
  formProps,
  formOptions,
}: SmartFormProps<TFieldValues, Schema>) {
  const methods = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    defaultValues,
    ...formOptions,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        {...formProps}
      >
        {children(methods)}
      </form>
    </FormProvider>
  );
}

// Export a type helper for form values based on schema
export type InferFormValues<T extends z.ZodType<any, any>> = z.infer<T>; 