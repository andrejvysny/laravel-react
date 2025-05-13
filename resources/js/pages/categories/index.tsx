import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { z } from 'zod';
import { SmartForm, InferFormValues } from '@/components/ui/smart-form';
import { TextInput, TextareaInput, ColorInput, SelectInput } from '@/components/ui/form-inputs';
import { IconPicker, icons } from '@/components/ui/icon-picker';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/layouts/page-header';
import { Icon } from '@/components/ui/icon';

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
  parent_category_id: z.string(),
});

type FormValues = InferFormValues<typeof formSchema>;

export default function Categories({ categories }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [icon, setIcon] = useState<string | null>(null);

  const defaultValues: FormValues = {
    name: '',
    description: '',
    color: '#6366F1',
    icon: 'ShoppingBag',
    parent_category_id: '0',
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIcon(null);
    setIsOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIcon(category.icon);
    setIsOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const formData = {
      ...values,
      icon: icon || values.icon,
      parent_category_id: values.parent_category_id === '0' ? null : values.parent_category_id
    };

    if (editingCategory) {
      router.put(`/categories/${editingCategory.id}`, formData, {
        onSuccess: () => {
          setIsOpen(false);
          setEditingCategory(null);
          setIcon(null);
        },
      });
    } else {
      router.post('/categories', formData, {
        onSuccess: () => {
          setIsOpen(false);
          setIcon(null);
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

  console.log(categories)
  // Add "None" option with a special value
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
                    {header: '', key: 'color', render: (row) => (
                      <div className="m-auto flex h-12 w-12 items-center justify-center rounded-full p-2" style={{ backgroundColor: row.color || '#6366F1' }}>
                        <Icon iconNode={icons[row.icon || '']} className="h-8 w-8 text-white"/>
                      </div>
                  )},
                      {header: 'Name', key: 'name'},
                        {header: 'Description', key: 'description'},
                        {header: 'Parent Category', key: 'parent_category', render: (row) => (
                            <span>{row.parent_category?.name || 'None'}</span>
                        )},
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
                              icon: editingCategory.icon || 'ShoppingBag',
                              parent_category_id: editingCategory.parent_category_id ? editingCategory.parent_category_id.toString() : '0',
                          } : defaultValues}
                          onSubmit={onSubmit}
                          formProps={{
                              className: 'space-y-4'
                          }}
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

                                  <div className="space-y-2">
                                      <label className="text-sm font-medium">Icon</label>
                                      <div onMouseDown={(e) => e.preventDefault()}>
                                          <IconPicker
                                              value={icon || 'ShoppingBag'}
                                              onChange={(value) => {
                                                  setIcon(value);
                                                  if (editingCategory) {
                                                      setEditingCategory({ ...editingCategory, icon: value });
                                                  }
                                              }}
                                          />
                                      </div>
                                  </div>

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
