"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import ConfirmationModal from "../components/ConfirmationModal";
import WaiterModal, { WaiterFormValues } from "../components/WaiterModal";
import { PAGINATION_RESERVED_HEIGHT } from "../components/Pagination";
import { usePagination } from "../lib/use-pagination";
import { useResponsiveGrid } from "../lib/use-responsive-grid";
import GarconsHeader from "./_components/GarconsHeader";
import GarconsTable from "./_components/GarconsTable";

function firstTableRow(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-table-row]");
}

interface Waiter {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  birthDate: string;
  active: boolean;
}

const initialWaiters: Waiter[] = [
  {
    id: "carlos-silva",
    name: "Carlos Silva",
    phone: "(11) 98765-4321",
    cpf: "12345678910",
    birthDate: "14051992",
    active: true,
  },
  {
    id: "ana-oliveira",
    name: "Ana Oliveira",
    phone: "(11) 97654-3210",
    cpf: "98765432100",
    birthDate: "22111995",
    active: true,
  },
  {
    id: "joao-santos",
    name: "João Santos",
    phone: "(11) 96543-2109",
    cpf: "45678912312",
    birthDate: "08021988",
    active: false,
  },
  {
    id: "maria-costa",
    name: "Maria Costa",
    phone: "(11) 95432-1098",
    cpf: "32165498700",
    birthDate: "30071990",
    active: true,
  },
  {
    id: "pedro-almeida",
    name: "Pedro Almeida",
    phone: "(11) 94321-0987",
    cpf: "65498732100",
    birthDate: "19091985",
    active: true,
  },
  {
    id: "juliana-ramos",
    name: "Juliana Ramos",
    phone: "(11) 93210-8765",
    cpf: "11122233344",
    birthDate: "05031993",
    active: true,
  },
  {
    id: "rafael-lima",
    name: "Rafael Lima",
    phone: "(11) 92109-8754",
    cpf: "22233344455",
    birthDate: "17062000",
    active: false,
  },
  {
    id: "camila-rocha",
    name: "Camila Rocha",
    phone: "(11) 91098-7643",
    cpf: "33344455566",
    birthDate: "29121991",
    active: true,
  },
  {
    id: "bruno-teixeira",
    name: "Bruno Teixeira",
    phone: "(11) 90987-6532",
    cpf: "44455566677",
    birthDate: "11041987",
    active: true,
  },
  {
    id: "fernanda-castro",
    name: "Fernanda Castro",
    phone: "(11) 89876-5421",
    cpf: "55566677788",
    birthDate: "23081996",
    active: false,
  },
  {
    id: "thiago-moura",
    name: "Thiago Moura",
    phone: "(11) 88765-4310",
    cpf: "66677788899",
    birthDate: "02102003",
    active: true,
  },
  {
    id: "patricia-alves",
    name: "Patrícia Alves",
    phone: "(11) 87654-3209",
    cpf: "77788899900",
    birthDate: "14071989",
    active: true,
  },
];

export default function GarconsPage() {
  const [waiters, setWaiters] = useState<Waiter[]>(initialWaiters);
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [editingWaiterId, setEditingWaiterId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [waiterToDelete, setWaiterToDelete] = useState<string | null>(null);

  const editingWaiter = waiters.find((waiter) => waiter.id === editingWaiterId);
  const waiterDeleteInfo = waiters.find((w) => w.id === waiterToDelete);

  function openNewWaiterModal() {
    setEditingWaiterId(null);
    setWaiterModalOpen(true);
  }

  function openEditWaiterModal(id: string) {
    setEditingWaiterId(id);
    setWaiterModalOpen(true);
  }

  function openDeleteConfirm(id: string) {
    setWaiterToDelete(id);
    setDeleteConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (waiterToDelete) {
      setWaiters((current) =>
        current.filter((waiter) => waiter.id !== waiterToDelete),
      );
      setDeleteConfirmOpen(false);
      setWaiterToDelete(null);
    }
  }

  function handleSubmitWaiter(values: WaiterFormValues) {
    if (editingWaiter) {
      setWaiters((current) =>
        current.map((waiter) =>
          waiter.id === editingWaiter.id
            ? { ...waiter, name: values.name, cpf: values.cpf, birthDate: values.birthDate }
            : waiter,
        ),
      );
      return;
    }
    setWaiters((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: values.name,
        cpf: values.cpf,
        birthDate: values.birthDate,
        phone: "",
        active: true,
      },
    ]);
  }

  const [pageSize, tableRef] = useResponsiveGrid({
    gap: 0,
    reservedBottom: PAGINATION_RESERVED_HEIGHT,
    columns: 1,
    minRows: 3,
    getItemElement: firstTableRow,
  });
  const { currentPage, totalPages, pageItems, setPage } = usePagination(
    waiters,
    pageSize,
  );

  return (
    <AppShell activeHref="/garcons">
      <GarconsHeader onNewWaiter={openNewWaiterModal} />

      <div className="flex flex-1 flex-col">
        <GarconsTable
          waiters={waiters}
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={openEditWaiterModal}
          onDelete={openDeleteConfirm}
          tableRef={tableRef}
        />
      </div>

      <WaiterModal
        isOpen={waiterModalOpen}
        onClose={() => setWaiterModalOpen(false)}
        onSubmit={handleSubmitWaiter}
        initialValues={
          editingWaiter
            ? { name: editingWaiter.name, cpf: editingWaiter.cpf, birthDate: editingWaiter.birthDate }
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setWaiterToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Garçom?"
        description={`Tem certeza que deseja excluir "${waiterDeleteInfo?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isDangerous
      />
    </AppShell>
  );
}
