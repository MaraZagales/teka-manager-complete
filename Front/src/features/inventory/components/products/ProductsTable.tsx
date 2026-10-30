import { ArrowDownAZ, ArrowUpAZ, Image, PackageOpen, Pencil, Power, RotateCcw } from "lucide-react";
import { DataTable, type DataTableColumn } from "../../../../components/data/DataTable";
import { StatusBadge } from "../../../../components/data/StatusBadge";
import { EcommerceImage } from "../../../ecommerce/EcommerceImage";
import type { ResumenCatalogoEcommerce } from "../../../../services/ecommerceApi";
import type { Product } from "../../../../services/productsApi";
import { formatProductName } from "../../../../services/productDisplay";
import type { ProductSortKey } from "../../types/products";

type Props = {
  products: Product[]; summaries: ResumenCatalogoEcommerce[]; loading: boolean; page: number; pageSize: number;
  sort: ProductSortKey; ascending: boolean; hasFilters: boolean; canCreate: boolean; canEdit: boolean; canDeactivate: boolean;
  onPageChange: (page: number) => void; onSort: (key: ProductSortKey) => void; onStateChange: (product: Product) => void;
};

export function ProductsTable({ products, summaries, loading, page, pageSize, sort, ascending, hasFilters, canCreate, canEdit, canDeactivate, onPageChange, onSort, onStateChange }: Props) {
  const visible = products.slice((page - 1) * pageSize, page * pageSize);
  const photos = new Map(summaries.map((summary) => [summary.productoId, summary.urlPortada]));
  function sortHeader(label: string, key: ProductSortKey) {
    const active = sort === key;
    return <button type="button" className="finished-products-sort" onClick={(event) => { event.stopPropagation(); onSort(key); }} aria-label={`Ordenar por ${label}${active ? ascending ? ", ascendente" : ", descendente" : ""}`}>{label}{active && (ascending ? <ArrowDownAZ size={14}/> : <ArrowUpAZ size={14}/>)}</button>;
  }
  const columns: DataTableColumn<Product>[] = [
    { key: "codigo", width: "13%", header: sortHeader("Código", "codigo"), render: (product) => <strong>{product.codigo}</strong> },
    { key: "nombre", width: "30%", header: sortHeader("Producto", "nombre"), headerClassName: "finished-product-name-header", render: (product) => <div className="finished-product-cell"><div className="finished-product-thumb">{photos.get(product.productoId) ? <EcommerceImage url={photos.get(product.productoId)} alt={formatProductName(product)}/> : <Image size={22}/>}</div><div><strong>{formatProductName(product)}</strong>{product.descripcion && <small>{product.descripcion}</small>}</div></div> },
    { key: "tipo", width: "19%", header: sortHeader("Categoría", "tipo"), render: (product) => product.tipoProductoNombre },
    { key: "estado", width: "18%", header: sortHeader("Estado", "estado"), className: "finished-products-state-cell", headerClassName: "finished-products-state-cell", render: (product) => <StatusBadge tone={product.activo ? "success" : "danger"}>{product.activo ? "Activo" : "Inactivo"}</StatusBadge> },
    { key: "action", width: "20%", header: "Acciones", className: "finished-products-action-cell", headerClassName: "finished-products-action-cell", render: (product) => <div className="finished-products-inline-actions" onClick={(event) => event.stopPropagation()}>{canEdit && <a href={`/inventory/products/${product.productoId}/edit`} title={`Editar ${formatProductName(product)}`} aria-label={`Editar ${formatProductName(product)}`}><Pencil size={16}/></a>}{((product.activo && canDeactivate) || (!product.activo && canEdit)) && <button type="button" title={product.activo ? "Inactivar producto" : "Reactivar producto"} aria-label={`${product.activo ? "Inactivar" : "Reactivar"} ${formatProductName(product)}`} onClick={() => onStateChange(product)}>{product.activo ? <Power size={17}/> : <RotateCcw size={17}/>}</button>}</div> },
  ];
  return <DataTable rows={visible} columns={columns} rowKey={(product) => product.productoId} loading={loading} loadingText="Cargando productos…" page={page} pageSize={pageSize} totalRecords={products.length} onPageChange={onPageChange} onRowClick={(product) => { location.href = `/inventory/products/${product.productoId}`; }} className="finished-products-table-card" tableClassName="finished-products-table" summary={<>Mostrando <strong>{visible.length}</strong> de <strong>{products.length}</strong> productos</>} emptyState={<div className="state-box finished-products-empty-state"><PackageOpen size={28}/><strong>{hasFilters ? "No hay resultados para estos filtros" : "Todavía no hay productos"}</strong><span>{hasFilters ? "Cambiá la búsqueda o limpiá los filtros." : "Registrá el primer producto terminado para comenzar."}</span>{!hasFilters && canCreate && <a className="button primary" href="/inventory/products/new">Registrar producto</a>}</div>}/>;
}
