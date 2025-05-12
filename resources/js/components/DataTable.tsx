import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, rowKey, emptyMessage = 'No data.' }: DataTableProps<T>) {
  return (

      <div className="mx-auto w-full max-w-7xl p-4">
          <div className="rounded-lg bg-card shadow-xs border-1 p-6">
              <div className="overflow-x-auto">

                      <Table>
                          <TableHeader>
                              <TableRow>
                                  {columns.map((col) => (
                                      <TableHead key={col.key} className={col.className}>{col.header}</TableHead>
                                  ))}
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {data.length === 0 ? (
                                  <TableRow>
                                      <TableCell colSpan={columns.length}
                                                 className="text-center text-muted-foreground py-8">
                                          {emptyMessage}
                                      </TableCell>
                                  </TableRow>
                              ) : (
                                  data.map((row) => (
                                      <TableRow key={rowKey(row)}>
                                          {columns.map((col) => (
                                              <TableCell key={col.key} className={col.className}>
                                                  {col.render ? col.render(row) : (row as any)[col.key]}
                                              </TableCell>
                                          ))}
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>


                  </div>
          </div>


      </div>
  );
}
