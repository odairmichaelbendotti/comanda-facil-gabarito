"use client";

import { useState } from "react";
import {
  LuBox,
  LuClipboardList,
  LuEye,
  LuLogOut,
  LuPencil,
  LuPlus,
  LuShoppingCart,
  LuTag,
  LuTrash2,
  LuUsers,
} from "react-icons/lu";

import AccessDenied from "../components/AccessDenied";
import AccordionHeader from "../components/AccordionHeader";
import Badge from "../components/Badge";
import Button from "../components/Button";
import CategoryCard from "../components/CategoryCard";
import CategoryModal from "../components/CategoryModal";
import ConfirmationModal from "../components/ConfirmationModal";
import Dropdown from "../components/Dropdown";
import EmptyState from "../components/EmptyState";
import FilterTab from "../components/FilterTab";
import Input from "../components/Input";
import Logo from "../components/Logo";
import MaskedInput from "../components/MaskedInput";
import MesaCard from "../components/MesaCard";
import ModalContainer from "../components/ModalContainer";
import NativeSelect from "../components/NativeSelect";
import NewMesaModal from "../components/NewMesaModal";
import NewOrderModal from "../components/NewOrderModal";
import NewProductModal from "../components/NewProductModal";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModal";
import PageHeader from "../components/PageHeader";
import PageLoadingState from "../components/PageLoadingState";
import Pagination from "../components/Pagination";
import Sidebar from "../components/Sidebar";
import SidebarNavItem from "../components/SidebarNavItem";
import SidebarPlanIndicators from "../components/SidebarPlanIndicators";
import Switch from "../components/Switch";
import Tab from "../components/Tab";
import Table from "../components/Table";
import Textarea from "../components/Textarea";
import FuncionarioModal from "../components/FuncionarioModal";

const buttonVariants = ["primary", "secondary", "ghost", "danger"] as const;
const badgeVariants = ["neutral", "success", "warning", "danger", "info"] as const;

const icons = [
  { label: "Cart", icon: <LuShoppingCart className="size-6" /> },
  { label: "Box", icon: <LuBox className="size-6" /> },
  { label: "Tag", icon: <LuTag className="size-6" /> },
  { label: "LogOut", icon: <LuLogOut className="size-6" /> },
  { label: "Eye", icon: <LuEye className="size-6" /> },
  { label: "Trash", icon: <LuTrash2 className="size-6" /> },
  { label: "Plus", icon: <LuPlus className="size-6" /> },
  { label: "ClipboardList", icon: <LuClipboardList className="size-6" /> },
  { label: "Users", icon: <LuUsers className="size-6" /> },
  { label: "Pencil", icon: <LuPencil className="size-6" /> },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-b border-[var(--color-border-subtle)] py-8 first:pt-0 last:border-b-0">
      <h2 className="font-display text-h3 text-[color:var(--color-text-primary)]">
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function PreviewPage() {
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [mesaModalOpen, setMesaModalOpen] = useState(false);
  const [funcionarioModalOpen, setFuncionarioModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <main className="mx-auto flex w-full max-w-300 flex-col gap-2 px-6 py-10">
      <h1 className="font-display text-display text-[color:var(--color-text-primary)]">
        Preview de componentes
      </h1>
      <p className="mb-4 text-body-md text-[color:var(--color-text-secondary)]">
        Uma instância de cada variante dos componentes base do design system.
      </p>

      <Section title="Logo">
        <Logo size="sm" />
        <Logo size="lg" />
      </Section>

      <Section title="Ícones (react-icons/lu)">
        {icons.map((item) => (
          <div
            key={item.label}
            className="flex w-20 flex-col items-center gap-1.5 rounded-md border border-[var(--color-border-subtle)] p-3 text-center"
          >
            <span className="text-[color:var(--color-text-secondary)]">
              {item.icon}
            </span>
            <span className="text-body-sm text-[color:var(--color-text-tertiary)]">
              {item.label}
            </span>
          </div>
        ))}
      </Section>

      <Section title="Button">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        {buttonVariants.map((variant) => (
          <Button key={`${variant}-disabled`} variant={variant} disabled>
            {variant} disabled
          </Button>
        ))}
      </Section>

      <Section title="Input">
        <Input label="Padrão" placeholder="Seu email completo..." />
        <Input label="Com erro" defaultValue="usuario@email" error="Email inválido" />
        <Input label="Desabilitado" placeholder="Indisponível" disabled />
      </Section>

      <Section title="Textarea">
        <div className="w-75">
          <Textarea label="Descrição" placeholder="Descreva a categoria (opcional)" />
        </div>
      </Section>

      <Section title="MaskedInput">
        <MaskedInput type="phone" label="Telefone" />
        <MaskedInput type="cpf" label="CPF" required />
        <MaskedInput type="cnpj" label="CNPJ" />
        <MaskedInput type="cep" label="CEP" />
        <MaskedInput type="date" label="Data de nascimento" />
        <MaskedInput type="currency" label="Valor" />
      </Section>

      <Section title="Badge">
        {badgeVariants.map((variant) => (
          <Badge key={variant} variant={variant} />
        ))}
      </Section>

      <Section title="Tab">
        <div className="flex gap-6">
          <Tab label="Ativa" active />
          <Tab label="Padrão" />
        </div>
      </Section>

      <Section title="FilterTab">
        <FilterTab label="Todos" active />
        <FilterTab label="Pendentes" />
      </Section>

      <Section title="SidebarNavItem">
        <div className="flex w-60 flex-col gap-1">
          <SidebarNavItem icon={<LuBox className="size-5" />} label="Pedidos" href="#" active />
          <SidebarNavItem icon={<LuTag className="size-5" />} label="Categorias" href="#" />
        </div>
      </Section>

      <Section title="PageHeader">
        <PageHeader
          title="Pedidos em produção"
          subtitle="Gerencie os pedidos da cozinha"
        />
      </Section>

      <Section title="Table">
        <Table
          columns={[
            { key: "name", label: "Nome" },
            { key: "price", label: "Preço" },
            { key: "category", label: "Categoria" },
            { key: "actions", label: "Ações" },
          ]}
          rows={[
            {
              name: "Coca-Cola Lata",
              price: (
                <span className="font-bold text-[color:var(--color-text-brand)]">
                  R$ 6,00
                </span>
              ),
              category: <Badge>Bebidas</Badge>,
              actions: (
                <div className="flex items-center gap-4">
                  <LuPencil className="size-4 text-(--color-text-secondary)" />
                  <LuTrash2 className="size-4 text-(--color-status-danger-text)" />
                </div>
              ),
            },
            {
              name: "Pizza Calabresa",
              price: (
                <span className="font-bold text-[color:var(--color-text-brand)]">
                  R$ 48,00
                </span>
              ),
              category: <Badge>Pizzas</Badge>,
              actions: (
                <div className="flex items-center gap-4">
                  <LuPencil className="size-4 text-(--color-text-secondary)" />
                  <LuTrash2 className="size-4 text-(--color-status-danger-text)" />
                </div>
              ),
            },
          ]}
        />
      </Section>

      <Section title="OrderCard">
        <OrderCard className="w-70" />
        <OrderCard
          className="w-70"
          title="Mesa 12"
          total="R$ 32,50"
          itemsCount={2}
          itemsSummary="2x Pizza Calabresa"
        />
      </Section>

      <Section title="CategoryCard">
        <CategoryCard className="w-55" title="Bebidas" subtitle="ID: 123012041-23912" />
        <CategoryCard className="w-55" title="Pizzas" subtitle="ID: 552012041-88213" />
        <CategoryCard
          className="w-55"
          title="Sobremesas"
          subtitle="6 produtos"
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </Section>

      <Section title="FilterTab / MesaCard">
        <MesaCard number="1" label="Mesa 1" />
        <MesaCard number="12" label="Mesa 12" />
      </Section>

      <Section title="AccordionHeader">
        <div className="flex w-100 flex-col gap-2">
          <AccordionHeader title="Bebidas" expanded />
          <AccordionHeader title="Pizzas" itemCount={3} expanded={false} />
        </div>
      </Section>

      <Section title="Dropdown">
        <div className="w-75">
          <Dropdown
            label="Categoria"
            options={[
              { value: "", label: "Selecionar..." },
              { value: "bebidas", label: "Bebidas" },
              { value: "pizzas", label: "Pizzas" },
            ]}
          />
        </div>
      </Section>

      <Section title="NativeSelect">
        <div className="w-75">
          <NativeSelect
            label="Categoria"
            options={[
              { value: "bebidas", label: "Bebidas" },
              { value: "pizzas", label: "Pizzas" },
            ]}
          />
        </div>
      </Section>

      <Section title="Switch">
        <div className="flex items-center gap-6">
          <Switch checked={switchOn} onChange={setSwitchOn} label="Disponibilidade" />
          <Switch checked={false} onChange={() => {}} label="Desligado" />
          <Switch checked disabled onChange={() => {}} label="Desabilitado ligado" />
        </div>
      </Section>

      <Section title="ModalContainer">
        <ModalContainer title="Título do Modal">
          <p className="text-body-md text-[color:var(--color-text-secondary)]">
            Conteúdo do modal.
          </p>
        </ModalContainer>
      </Section>

      <Section title="NewOrderModal / OrderDetailModal / NewProductModal">
        <Button onClick={() => setNewOrderOpen(true)}>Abrir Novo Pedido</Button>
        <Button variant="secondary" onClick={() => setOrderDetailOpen(true)}>
          Abrir Detalhes do Pedido
        </Button>
        <Button variant="secondary" onClick={() => setNewProductOpen(true)}>
          Abrir Novo Produto
        </Button>
        <NewOrderModal
          isOpen={newOrderOpen}
          onClose={() => setNewOrderOpen(false)}
        />
        <OrderDetailModal
          isOpen={orderDetailOpen}
          onClose={() => setOrderDetailOpen(false)}
          order={{
            table: "Mesa 52",
            items: [
              { name: "Coca-Cola Lata", qty: 1, price: 6 },
              { name: "Pizza Frango c/ Catupiry", qty: 1, price: 30 },
            ],
            isInProgress: true,
            receivedAt: "14:32",
          }}
        />
        <NewProductModal
          isOpen={newProductOpen}
          onClose={() => setNewProductOpen(false)}
          categories={[
            { id: 1, nome: "Bebidas" },
            { id: 2, nome: "Pizzas" },
          ]}
        />
      </Section>

      <Section title="CategoryModal">
        <Button onClick={() => setCategoryModalOpen(true)}>
          Abrir Nova/Editar Categoria
        </Button>
        <CategoryModal
          isOpen={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
        />
      </Section>

      <Section title="NewMesaModal">
        <Button onClick={() => setMesaModalOpen(true)}>Abrir Nova Mesa</Button>
        <NewMesaModal
          isOpen={mesaModalOpen}
          onClose={() => setMesaModalOpen(false)}
          suggestedNumber={13}
        />
      </Section>

      <Section title="ConfirmationModal">
        <Button variant="danger" onClick={() => setConfirmationOpen(true)}>
          Abrir Modal de Confirmação
        </Button>
        <ConfirmationModal
          isOpen={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={() => {
            setConfirmationOpen(false);
          }}
          title="Excluir Produto?"
          description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
          confirmLabel="Confirmar"
          isDangerous
        />
      </Section>

      <Section title="FuncionarioModal">
        <Button onClick={() => setFuncionarioModalOpen(true)}>
          Abrir Novo/Editar Funcionário
        </Button>
        <FuncionarioModal
          isOpen={funcionarioModalOpen}
          onClose={() => setFuncionarioModalOpen(false)}
        />
      </Section>

      <Section title="Pagination">
        <div className="w-full">
          <Pagination
            currentPage={previewPage}
            totalPages={9}
            onPageChange={setPreviewPage}
          />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState />
      </Section>

      <Section title="PageLoadingState">
        <div className="h-40 w-full border border-dashed border-[var(--color-border-subtle)]">
          <PageLoadingState />
        </div>
      </Section>

      <Section title="AccessDenied">
        <div className="h-90 w-full border border-dashed border-[var(--color-border-subtle)]">
          <AccessDenied />
        </div>
      </Section>

      <Section title="SidebarPlanIndicators">
        <div className="flex w-60 flex-col gap-4">
          <SidebarPlanIndicators ordersUsed={17} ordersLimit={30} />
          <SidebarPlanIndicators ordersUsed={28} ordersLimit={30} />
          <SidebarPlanIndicators premium />
        </div>
      </Section>

      <Section title="Sidebar">
        <div className="h-175">
          <Sidebar
            activeHref="#pedidos"
            userName="Odair Michael"
            items={[
              { key: "pedidos", icon: <LuClipboardList className="size-4.5" />, label: "Pedidos", href: "#pedidos" },
              { key: "produtos", icon: <LuBox className="size-4.5" />, label: "Produtos", href: "#produtos" },
              { key: "configuracoes", icon: <LuTag className="size-4.5" />, label: "Configurações", href: "#configuracoes" },
              { key: "funcionarios", icon: <LuUsers className="size-4.5" />, label: "Funcionários", href: "#funcionarios" },
            ]}
          />
        </div>
      </Section>
    </main>
  );
}
