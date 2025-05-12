import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { z } from 'zod';
import { SmartForm, InferFormValues } from '@/components/ui/smart-form';
import { TextInput, TextareaInput, ColorInput, SelectInput } from '@/components/ui/form-inputs';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/layouts/page-header';

interface Category {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parent_category_id: number | null;
  parentCategory?: Category | null;
}

interface Props {
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  parent_category_id: z.number().nullable(),
});

type FormValues = InferFormValues<typeof formSchema>;

export default function Categories({ categories }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const defaultValues: FormValues = {
    name: '',
    description: '',
    color: '#6366F1',
    icon: '',
    parent_category_id: null,
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editingCategory) {
      router.put(`/categories/${editingCategory.id}`, values, {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    } else {
      router.post('/categories', values, {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    }
  };

  const deleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      router.delete(`/categories/${id}`);
    }
  };

  // Prepare parent category options for select input
  const parentCategoryOptions = categories
    .filter((c) => editingCategory ? c.id !== editingCategory.id : true)
    .map((category) => ({
      value: category.id.toString(),
      label: category.name,
    }));

  // Add "None" option with a non-empty value
  parentCategoryOptions.unshift({ value: "0", label: "None" });

  return (
      <AppLayout>
          <Head title="Categories" />
          <div className="mx-auto w-full max-w-7xl p-4">
              <div className="mx-auto w-full max-w-7xl">
                  <PageHeader title="Categories" buttons={[
                      {
                          onClick: () => openCreateModal(),
                          label: 'New Category',
                      },
                  ]} />
              </div>
          </div>

          <DataTable
              columns={
                  [
                      {header: 'Name', key: 'name'},
                        {header: 'Description', key: 'description'},
                        {header: 'Color', key: 'color', render: (row) => (
                            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: row.color }} />
                        )},
                        {header: 'Parent Category', key: 'parentCategory', render: (row) => row.parentCategory?.name || ''},
                        {header: 'Actions', key: 'actions', className: 'text-right', render: (row) => (
                            <div className="flex justify-end">
                                <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditModal(row)}>
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteCategory(row.id)}>
                                    Delete
                                </Button>
                            </div>
                        )},
                  ]
              }
              data={categories}
              rowKey={
                  (record) => record.id
              }
          />






              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                          <DialogDescription>
                              {editingCategory ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
                          </DialogDescription>
                      </DialogHeader>
                      <SmartForm
                          schema={formSchema}
                          defaultValues={editingCategory ? {
                              name: editingCategory.name,
                              description: editingCategory.description || '',
                              color: editingCategory.color || '#6366F1',
                              icon: editingCategory.icon || '',
                              parent_category_id: editingCategory.parent_category_id,
                          } : defaultValues}
                          onSubmit={onSubmit}
                          formProps={{ className: 'space-y-4' }}
                      >
                          {() => (
                              <>
                                  <TextInput<FormValues>
                                      name="name"
                                      label="Name"
                                      required
                                  />

                                  <TextareaInput<FormValues>
                                      name="description"
                                      label="Description"
                                  />

                                  <ColorInput<FormValues>
                                      name="color"
                                      label="Color"
                                  />

                                  <TextInput<FormValues>
                                      name="icon"
                                      label="Icon"
                                  />

                                  <SelectInput<FormValues>
                                      name="parent_category_id"
                                      label="Parent Category"
                                      options={parentCategoryOptions}
                                  />

                                  <DialogFooter>
                                      <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
                                  </DialogFooter>
                              </>
                          )}
                      </SmartForm>
                  </DialogContent>
              </Dialog>

      </AppLayout>
  );
}
