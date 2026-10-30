import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  History,
  Plus,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "../../components/layout/AppShell";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/data/DataTable";
import { DataTableFilters } from "../../components/data/DataTableFilters";
import { PageHeader } from "../../components/data/PageHeader";
import { StatusBadge } from "../../components/data/StatusBadge";
import { apiErrorMessage } from "../../services/apiClient";
import { hasPermission } from "../../services/authorization";
import { formatProductName } from "../../services/productDisplay";
import { productsApi, type Product } from "../../services/productsApi";
import {
  salesPricesApi,
  type SalesPrice,
  type SalesPriceCorrection,
} from "../../services/salesPricesApi";
import { PriceHistoryModal } from "./PriceHistoryModal";
import "./salesPrices.css";

type PriceFilter = "all" | "with" | "without";
type ProductFilter = "active" | "inactive" | "all";
type SortKey = "code" | "name" | "type" | "price" | "date" | "state";
const PAGE_SIZE = 8;
const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});
const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-AR") : "—";

export function SalesPricesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [prices, setPrices] = useState<SalesPrice[]>([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [productFilter, setProductFilter] = useState<ProductFilter>("active");
  const [sort, setSort] = useState<SortKey>("code");
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<SalesPrice[]>([]);
  const [corrections, setCorrections] = useState<SalesPriceCorrection[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const canCreate = hasPermission("Costos y precios", "Crear");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [catalog, priceRows] = await Promise.all([
        productsApi.list(),
        salesPricesApi.list(),
      ]);
      setProducts(catalog);
      setPrices(priceRows);
    } catch (cause) {
      setError(
        apiErrorMessage(
          cause,
          "No se pudieron consultar los precios de venta.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    const saved = sessionStorage.getItem("sales-prices-notice");
    if (saved) {
      setNotice(saved);
      sessionStorage.removeItem("sales-prices-notice");
    }
  }, []);
  const currentByProduct = useMemo(
    () =>
      new Map(
        prices.filter((row) => row.activo).map((row) => [row.productoId, row]),
      ),
    [prices],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-AR");
    const result = products.filter((product) => {
      const current = currentByProduct.get(product.productoId);
      return (
        `${product.codigo} ${product.nombre} ${formatProductName(product)}`
          .toLocaleLowerCase("es-AR")
          .includes(query) &&
        (priceFilter === "all" ||
          (priceFilter === "with" ? Boolean(current) : !current)) &&
        (productFilter === "all" ||
          (productFilter === "active" ? product.activo : !product.activo))
      );
    });
    result.sort((a, b) => {
      const pa = currentByProduct.get(a.productoId),
        pb = currentByProduct.get(b.productoId);
      const va =
        sort === "code"
          ? a.codigo
          : sort === "name"
            ? formatProductName(a)
            : sort === "type"
              ? a.tipoProductoNombre
              : sort === "price"
                ? (pa?.precio ?? -1)
                : sort === "date"
                  ? (pa?.fechaVigenciaDesde ?? "")
                  : Number(a.activo);
      const vb =
        sort === "code"
          ? b.codigo
          : sort === "name"
            ? formatProductName(b)
            : sort === "type"
              ? b.tipoProductoNombre
              : sort === "price"
                ? (pb?.precio ?? -1)
                : sort === "date"
                  ? (pb?.fechaVigenciaDesde ?? "")
                  : Number(b.activo);
      const comparison =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "es-AR", { numeric: true });
      return (
        (ascending ? comparison : -comparison) || a.productoId - b.productoId
      );
    });
    return result;
  }, [
    products,
    currentByProduct,
    search,
    priceFilter,
    productFilter,
    sort,
    ascending,
  ]);
  const actualPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  );
  const visible = filtered.slice(
    (actualPage - 1) * PAGE_SIZE,
    actualPage * PAGE_SIZE,
  );
  const hasFilters = Boolean(
    search || priceFilter !== "all" || productFilter !== "active",
  );
  function changeSort(key: SortKey) {
    if (sort === key) setAscending((value) => !value);
    else {
      setSort(key);
      setAscending(true);
    }
    setPage(1);
  }
  function heading(label: string, key: SortKey) {
    return (
      <button
        type="button"
        className="supplies-sort"
        onClick={() => changeSort(key)}
      >
        {label}
        {sort === key &&
          (ascending ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />)}
      </button>
    );
  }
  async function openHistory(product: Product) {
    setHistoryProduct(product);
    setHistoryLoading(true);
    setHistoryError("");
    setHistory([]);
    setCorrections([]);
    try {
      const [rows, audits] = await Promise.all([
        salesPricesApi.history(product.productoId),
        salesPricesApi.corrections(product.productoId),
      ]);
      setHistory(rows);
      setCorrections(audits);
    } catch (cause) {
      setHistoryError(
        apiErrorMessage(cause, "No se pudo consultar el historial."),
      );
    } finally {
      setHistoryLoading(false);
    }
  }
  const columns: DataTableColumn<Product>[] = [
    {
      key: "code",
      header: heading("Código", "code"),
      render: (row) => <strong>{row.codigo}</strong>,
    },
    {
      key: "name",
      header: heading("Producto", "name"),
      render: (row) => <strong>{formatProductName(row)}</strong>,
    },
    {
      key: "type",
      header: heading("Tipo", "type"),
      render: (row) => row.tipoProductoNombre,
    },
    {
      key: "price",
      header: heading("Precio vigente", "price"),
      className: "sales-price-money",
      render: (row) => {
        const current = currentByProduct.get(row.productoId);
        return current ? (
          <strong>{money.format(current.precio)}</strong>
        ) : (
          <span>Sin precio vigente</span>
        );
      },
    },
    {
      key: "date",
      header: heading("Vigente desde", "date"),
      render: (row) =>
        date(currentByProduct.get(row.productoId)?.fechaVigenciaDesde ?? null),
    },
    {
      key: "state",
      header: heading("Estado", "state"),
      render: (row) => (
        <StatusBadge
          tone={
            !row.activo
              ? "neutral"
              : currentByProduct.has(row.productoId)
                ? "success"
                : "warning"
          }
        >
          {!row.activo
            ? "Inactivo"
            : currentByProduct.has(row.productoId)
              ? "Vigente"
              : "Sin precio"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (row) => {
        return (
          <div
            className="sales-price-inline-actions"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              title="Historial"
              aria-label={`Historial de ${formatProductName(row)}`}
              onClick={() => void openHistory(row)}
            >
              <History size={17} />
            </button>
            {canCreate && row.activo && (
              <a
                href={`/ventas/precios/nuevo?productoId=${row.productoId}`}
                title="Registrar nuevo precio"
                aria-label={`Registrar precio de ${formatProductName(row)}`}
              >
                <Plus size={17} />
              </a>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <AppShell title="Precios de venta" breadcrumb="Ventas / Precios de venta">
      <div className="sales-prices-page">
        <PageHeader
          title="Precios de venta"
          action={
            canCreate ? (
              <a href="/ventas/precios/nuevo" className="button primary">
                <Plus size={16} /> Registrar precio
              </a>
            ) : undefined
          }
        />
        {notice && (
          <div className="sales-prices-success" role="status">
            {notice}
          </div>
        )}
        {error && (
          <div className="sales-prices-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="button secondary"
              onClick={() => void load()}
            >
              <RefreshCw size={15} /> Reintentar
            </button>
          </div>
        )}
        <DataTableFilters
          balanced
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por código, nombre o color"
          onClear={() => {
            setSearch("");
            setPriceFilter("all");
            setProductFilter("active");
            setPage(1);
          }}
          clearDisabled={!hasFilters}
          className="sales-prices-filters"
        >
          <label className="data-table-filter-field">
            <span>Precio</span>
            <select
              value={priceFilter}
              onChange={(event) => {
                setPriceFilter(event.target.value as PriceFilter);
                setPage(1);
              }}
            >
              <option value="all">Todos</option>
              <option value="with">Con precio vigente</option>
              <option value="without">Sin precio vigente</option>
            </select>
          </label>
          <label className="data-table-filter-field">
            <span>Producto</span>
            <select
              value={productFilter}
              onChange={(event) => {
                setProductFilter(event.target.value as ProductFilter);
                setPage(1);
              }}
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="all">Todos</option>
            </select>
          </label>
        </DataTableFilters>
        <DataTable
          rows={visible}
          columns={columns}
          rowKey={(row) => row.productoId}
          loading={loading}
          loadingText="Consultando productos y precios…"
          page={actualPage}
          pageSize={PAGE_SIZE}
          totalRecords={filtered.length}
          onPageChange={setPage}
          tableClassName="sales-prices-table"
          summary={
            <>
              <strong>{filtered.length} productos</strong>
              <span>
                {
                  filtered.filter(
                    (row) => !currentByProduct.has(row.productoId),
                  ).length
                }{" "}
                sin precio vigente
              </span>
            </>
          }
          emptyState={
            <div className="state-box">
              {hasFilters
                ? "No hay productos para los filtros aplicados."
                : "No hay productos para administrar."}
            </div>
          }
        />
        {historyProduct && (
          <PriceHistoryModal
            product={historyProduct}
            prices={history}
            corrections={corrections}
            loading={historyLoading}
            error={historyError}
            onClose={() => setHistoryProduct(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
