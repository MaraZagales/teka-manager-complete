import { Gift, Tags } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/data/PageHeader';
import { PromotionsCatalogTab } from './PromotionsCatalogTab';
import { CutBenefitsTab } from './CutBenefitsTab';
import './promotionsBenefits.css';

type Tab='promotions'|'cuts';
export function PromotionsBenefitsPage(){
  const [tab,setTab]=useState<Tab>('promotions');
  return <AppShell title="Recortes y Promociones" breadcrumb="E-commerce / Recortes y Promociones"><main className="promotions-benefits-page"><PageHeader kicker="E-COMMERCE" title="Recortes y Promociones" description="Administrá descuentos del catálogo y beneficios de muebles terminados fabricados con recortes."/><nav className="promotions-tabs" aria-label="Secciones de promociones y beneficios"><button type="button" className={tab==='promotions'?'active':''} onClick={()=>setTab('promotions')}><Tags size={18}/><span><strong>Promociones del catálogo</strong><small>Descuentos y productos alcanzados</small></span></button><button type="button" className={tab==='cuts'?'active':''} onClick={()=>setTab('cuts')}><Gift size={18}/><span><strong>Beneficios por recortes</strong><small>Muebles terminados, umbral y utilización</small></span></button></nav>{tab==='promotions'?<PromotionsCatalogTab/>:<CutBenefitsTab/>}</main></AppShell>;
}
