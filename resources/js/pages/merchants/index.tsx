import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { z } from 'zod';
import { SmartForm, InferFormValues } from '@/components/ui/smart-form';
import { TextInput, TextareaInput } from '@/components/ui/form-inputs';
import { DataTable } from '@/components/DataTable';
import PageHeader from '@/layouts/page-header';

interface Merchant {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
}

interface Props {
  merchants: Merchant[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().nullable(),
  logo: z.string().nullable(),
});

type FormValues = InferFormValues<typeof formSchema>;

export default function Merchants({ merchants }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);

  const defaultValues: FormValues = {
    name: '',
    description: '',
    logo: '',
  };

  const openCreateModal = () => {
    setEditingMerchant(null);
    setIsOpen(true);
  };

  const openEditModal = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setIsOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    if (editingMerchant) {
      router.put(`/merchants/${editingMerchant.id}`, values, {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    } else {
      router.post('/merchants', values, {
        onSuccess: () => {
          setIsOpen(false);
        },
      });
    }
  };

  const deleteMerchant = (id: number) => {
    if (confirm('Are you sure you want to delete this merchant?')) {
      router.delete(`/merchants/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="Merchants" />
      <div className="mx-auto w-full max-w-7xl p-4">
        <div className="mx-auto w-full max-w-7xl">
          <PageHeader title="Merchants" buttons={[
            {
              onClick: () => openCreateModal(),
              label: 'New Merchant',
            },
          ]} />
        </div>
      </div>

      <DataTable
        columns={[
            { header: 'Logo', key: 'logo',className: "p-0", render: (row) => (
                    row.logo ? <img src={row.logo} alt={row.name} className="w-full max-w-20 object-contain" /> : null
                )},
          { header: 'Name', key: 'name' },
          { header: 'Description', key: 'description' },

          { header: 'Actions', key: 'actions', className: 'text-right', render: (row) => (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditModal(row)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteMerchant(row.id)}>
                Delete
              </Button>
            </div>
          )},
        ]}
        data={merchants}
        rowKey={(record) => record.id}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMerchant ? 'Edit Merchant' : 'Add Merchant'}</DialogTitle>
            <DialogDescription>
              {editingMerchant ? 'Update the merchant details below.' : 'Fill in the details to create a new merchant.'}
            </DialogDescription>
          </DialogHeader>
          <SmartForm
            schema={formSchema}
            defaultValues={editingMerchant ? {
              name: editingMerchant.name,
              description: editingMerchant.description || '',
              logo: editingMerchant.logo || '',
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

                <TextInput<FormValues>
                  name="logo"
                  label="Logo URL"
                />

                <DialogFooter>
                  <Button type="submit">{editingMerchant ? 'Update' : 'Create'}</Button>
                </DialogFooter>
              </>
            )}
          </SmartForm>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
