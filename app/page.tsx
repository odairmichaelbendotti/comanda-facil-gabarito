"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Badge from "./components/Badge";
import Button from "./components/Button";
import Logo from "./components/Logo";
import OrderCard from "./components/OrderCard";
import { useAuthStore } from "./lib/store/auth-store";

function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
}

function Testimonial({ quote, name, role }: TestimonialProps) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`bg-(--color-bg-canvas) flex flex-1 flex-col gap-4 rounded-lg p-8 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <p className="font-regular text-body-md text-(--color-text-secondary) leading-relaxed">
        "{quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-(--color-brand-primary)" />
        <div>
          <p className="text-label-md font-bold text-(--color-text-primary)">
            {name}
          </p>
          <p className="text-label-sm text-(--color-text-tertiary)">{role}</p>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`bg-(--color-bg-canvas) flex flex-1 flex-col gap-4 rounded-lg border border-(--color-border-subtle) p-6 transition-colors duration-150 motion-reduce:transition-none hover:border-(--color-border-focus) ${visible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <h3 className="text-h3 font-display font-semibold text-(--color-text-primary)">
        {title}
      </h3>
      <p className="text-body-md text-(--color-text-secondary) leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  isPremium?: boolean;
  buttonText: string;
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  isPremium = false,
  buttonText,
}: PricingCardProps) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`flex flex-1 flex-col gap-6 rounded-2xl p-10 ${
        visible ? "animate-fade-in-up" : "opacity-0"
      } ${
        isPremium
          ? "border-2 border-(--color-brand-primary) bg-(--color-bg-surface) shadow-lg"
          : "border border-(--color-border-default) bg-(--color-bg-surface)"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h2 font-display font-semibold text-(--color-text-primary)">
            {title}
          </h3>
          {isPremium && <Badge variant="warning">RECOMENDADO</Badge>}
        </div>
        <p className="text-body-md text-(--color-text-secondary)">
          {description}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className={`text-display font-display font-bold ${
            isPremium
              ? "text-(--color-brand-primary)"
              : "text-(--color-text-primary)"
          }`}
        >
          {price}
        </span>
        {period && (
          <span className="text-body-md text-(--color-text-tertiary)">
            {period}
          </span>
        )}
      </div>

      <div className="h-px w-full bg-(--color-border-subtle)" />

      <div className="flex flex-col gap-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className={
                feature.included
                  ? "text-(--color-status-success-text)"
                  : "text-(--color-text-tertiary)"
              }
            >
              {feature.included ? "✓" : "✗"}
            </span>
            <p
              className={`text-body-md ${
                feature.included
                  ? "text-(--color-text-secondary)"
                  : "text-(--color-text-tertiary)"
              }`}
            >
              {feature.text}
            </p>
          </div>
        ))}
      </div>

      <Link href="/login" className="w-full">
        <Button
          variant={isPremium ? "primary" : "secondary"}
          className="w-full"
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/sessao", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled || !response.ok) return;

        const data = await response.json();
        setUser(
          {
            id: data.id,
            name: data.nome,
            role: data.role,
            estabelecimentoId: data.estabelecimentoId,
          },
          data.plano,
        );
        router.replace("/pedidos");
      })
      .catch(() => {
        // Sem sessão válida (ou erro de rede) - permanece na landing normalmente.
      });

    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  return (
    <div className="min-h-screen bg-(--color-bg-canvas)">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-(--color-border-subtle) bg-(--color-bg-sidebar) transition-colors duration-150 motion-reduce:transition-none">
        <div className="mx-auto flex max-w-360 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-20 lg:py-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size="lg" />
            <Badge variant="success">SaaS</Badge>
          </div>

          {/* Nav Links - Hidden on mobile */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-label-md font-semibold text-(--color-text-primary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-brand-primary)"
            >
              Funcionalidades
            </a>
            <a
              href="#pricing"
              className="text-label-md font-semibold text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary)"
            >
              Preços
            </a>
            <a
              href="#testimonials"
              className="text-label-md font-semibold text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary)"
            >
              Depoimentos
            </a>
            <a
              href="#footer"
              className="text-label-md font-semibold text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary)"
            >
              Contato
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login">
              <Button variant="secondary" className="text-label-md">
                Entrar
              </Button>
            </Link>
            <Link href="/login?signup=true">
              <Button variant="primary" className="text-label-md">
                Comece Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-(--color-bg-canvas)">
        <div className="mx-auto grid max-w-360 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-20 lg:py-20">
          {/* Hero Content */}
          <div className="animate-fade-in-up flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <Badge variant="neutral" className="self-start">
                GESTÃO COMPLETA PARA RESTAURANTES
              </Badge>
              <h1 className="text-display font-display font-bold leading-tight text-(--color-text-primary)">
                Seu restaurante sob controle, do pedido à entrega
              </h1>
              <p className="text-body-lg leading-relaxed text-(--color-text-secondary)">
                Simplifique o gerenciamento do seu restaurante. Controle
                pedidos em produção, gerencie garçons, organize o fluxo de
                mesas e atualize seu cardápio em tempo real com facilidade e
                eficiência.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/login?signup=true" className="flex-1 sm:flex-none">
                <Button variant="primary" className="w-full sm:w-auto">
                  Comece de graça
                </Button>
              </Link>
              <a href="#pricing" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full">
                  Ver Planos e Preços
                </Button>
              </a>
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-6 pt-4 sm:flex-row sm:gap-10">
              <div className="flex flex-col gap-1">
                <p className="text-h2 font-display font-bold text-(--color-text-brand)">
                  +2.500
                </p>
                <p className="text-body-md text-(--color-text-secondary)">
                  Restaurantes gerenciados
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-h2 font-display font-bold text-(--color-text-brand)">
                  99.9%
                </p>
                <p className="text-body-md text-(--color-text-secondary)">
                  Tempo de atividade estável
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual - Order Cards */}
          <div className="animate-fade-in-up rounded-3xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-6 shadow-lg sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-h3 font-display font-semibold text-(--color-text-primary)">
                Painel em Tempo Real
              </h3>
              <Badge variant="success">6 Pedidos Ativos</Badge>
            </div>

            {/* Order Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <OrderCard
                title="Mesa 12"
                itemsCount={1}
                itemsSummary="1x Pizza Calabresa, 1x Guaraná"
                total="R$ 48,00"
              />
              <OrderCard
                title="Mesa 04"
                itemsCount={1}
                itemsSummary="1x Pizza Quatro Queijos, 1x Coca-Cola"
                total="R$ 54,00"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="scroll-mt-16 border-b border-t border-(--color-border-subtle) bg-(--color-bg-surface) lg:scroll-mt-20"
      >
        <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="neutral">FUNCIONALIDADES EXCLUSIVAS</Badge>
            <h2 className="text-h2 font-display font-bold text-(--color-text-primary)">
              Tudo o que seu restaurante precisa para decolar
            </h2>
            <p className="max-w-2xl text-body-lg text-(--color-text-secondary)">
              Nossa plataforma foi desenhada especificamente para a dinâmica
              ágil de restaurantes, eliminando gargalos de produção e
              acelerando o tempo de entrega.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Gestão de Pedidos"
              description="Visualize e organize a fila de preparo por tempo de espera ou prioridade. Evite atrasos e mantenha a equipe da cozinha em perfeita sincronia."
            />
            <FeatureCard
              title="Controle de Mesas"
              description="Tenha um mapa visual completo do salão. Acompanhe a ocupação de cada mesa, o status dos pedidos e a conta ativa em tempo real."
            />
            <FeatureCard
              title="Cardápio Digital"
              description="Faça alterações instantâneas de preços, ingredientes e disponibilidade. Crie categorias dinâmicas como pizzas doces, salgadas e bebidas."
            />
            <FeatureCard
              title="Gestão de Funcionários"
              description="Atribua mesas e gerencie as comandas enviadas diretamente pelo smartphone do funcionário, sem a necessidade de rascunhos de papel."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-16 lg:scroll-mt-20">
        <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="neutral">PREÇOS TRANSPARENTES</Badge>
            <h2 className="text-h2 font-display font-bold text-(--color-text-primary)">
              O plano ideal para o tamanho do seu negócio
            </h2>
            <p className="max-w-2xl text-body-lg text-(--color-text-secondary)">
              Comece gratuitamente para experimentar nossas facilidades e
              mude para o Premium conforme sua operação expandir.
            </p>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:justify-center">
            <PricingCard
              title="Plano Gratuito"
              price="R$ 0"
              period="/ sempre grátis"
              description="Para pizzerias iniciantes que precisam do controle básico e com pouca movimentação."
              features={[
                { text: "Até 50 pedidos por mês", included: true },
                { text: "Cadastro de até 5 mesas", included: true },
                { text: "Cadastro simplificado de produtos", included: true },
                { text: "Sem relatórios avançados", included: false },
                { text: "Suporte padrão por e-mail", included: false },
              ]}
              buttonText="Cadastrar Grátis"
            />

            <PricingCard
              title="Plano Premium"
              price="R$ 99"
              period="/ mês"
              description="Para restaurantes em crescimento que necessitam de operação ilimitada e suporte de alto nível."
              features={[
                { text: "Pedidos absolutamente ilimitados", included: true },
                { text: "Controle de mesas sem limites", included: true },
                {
                  text: "Painel financeiro e relatórios avançados",
                  included: true,
                },
                { text: "Gestão multi-unidades de garçons", included: true },
                {
                  text: "Suporte prioritário via WhatsApp 24/7",
                  included: true,
                },
              ]}
              isPremium
              buttonText="Assinar Premium"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="scroll-mt-16 border-b border-t border-(--color-border-subtle) bg-(--color-bg-surface) lg:scroll-mt-20"
      >
        <div className="mx-auto max-w-360 px-4 py-16 sm:px-6 lg:px-20 lg:py-20">
          <div className="mb-12 flex flex-col items-center gap-3 text-center">
            <Badge variant="neutral">HISTÓRIAS DE SUCESSO</Badge>
            <h2 className="text-h2 font-display font-bold text-(--color-text-primary)">
              Aprovado por quem entende de sabor e negócio
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Testimonial
              quote="O ComandaFácil mudou totalmente nossa dinâmica. Os garçons realizam os pedidos do salão e na hora o pessoal da cozinha começa a preparar. Economizamos tempo e agradamos o cliente."
              name="Lucas Silva"
              role="Dono da Bella Pizza"
            />
            <Testimonial
              quote="Excelente plataforma de gestão. O painel financeiro do plano premium reduziu nossa margem de erros a zero. O suporte deles pelo WhatsApp é incrivelmente ágil e assertivo."
              name="Juliana Santos"
              role="Gerente da Forno d'Oro"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="scroll-mt-16 lg:scroll-mt-20">
        <div className="mx-auto max-w-360 px-4 pt-12 pb-8 sm:px-6 lg:px-20 lg:pt-16 lg:pb-10">
          <div className="mb-8 flex flex-col gap-8 md:flex-row md:justify-between">
            {/* Brand */}
            <div className="flex max-w-80 flex-col gap-4">
              <Logo size="lg" className="self-start" />
              <p className="text-body-md text-(--color-text-secondary) leading-relaxed">
                A tecnologia que faltava na sua operação de massas. Gestão
                descomplicada para focar no que realmente importa: a melhor
                pizza.
              </p>
            </div>

            <div className="flex gap-16">
              {/* Product Links */}
              <div className="flex flex-col gap-3">
                <p className="text-label-md font-bold text-(--color-text-primary)">
                  Produto
                </p>
                <nav className="flex flex-col gap-2">
                  <a
                    href="#features"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Funcionalidades
                  </a>
                  <a
                    href="#pricing"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Preços
                  </a>
                  <a
                    href="#"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Segurança
                  </a>
                </nav>
              </div>

              {/* Company Links */}
              <div className="flex flex-col gap-3">
                <p className="text-label-md font-bold text-(--color-text-primary)">
                  Empresa
                </p>
                <nav className="flex flex-col gap-2">
                  <a
                    href="#"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Sobre nós
                  </a>
                  <a
                    href="#"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Suporte
                  </a>
                  <a
                    href="#"
                    className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                  >
                    Blog
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="border-t border-(--color-border-subtle) pt-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-body-sm text-(--color-text-tertiary)">
                © 2026 ComandaFácil. Todos os direitos reservados.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                >
                  Privacidade
                </a>
                <a
                  href="#"
                  className="text-body-sm text-(--color-text-secondary) transition-colors duration-150 motion-reduce:transition-none hover:text-(--color-text-primary) cursor-pointer"
                >
                  Termos de Uso
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
