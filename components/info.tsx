'use client';

import { Product } from '@/types';
import Currency from '@/components/ui/currency';
import { FaWhatsapp } from 'react-icons/fa';
import React from 'react';
import Link from 'next/link';

interface InfoProps {
  data: Product;
}

type DateLike = string | number | Date | null | undefined;
type AnyObj = Record<string, unknown>;

const coerceDate = (val: DateLike): Date | null => {
  if (val == null) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

// key paths we’ll try on each object (supports shallow and nested under `meta`)
const DATE_KEY_PATHS = ['priceUpdatedAt', 'priceAt', 'priceDate', 'updatedAt', 'createdAt', 'syncedAt', 'meta.priceUpdatedAt', 'meta.priceAt', 'meta.priceDate'] as const;

// tiny util to read "a.b.c" safely
const getByPath = (obj: AnyObj, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as AnyObj)) {
      return (acc as AnyObj)[key];
    }
    return undefined;
  }, obj);
};

const pickDateFrom = (obj: AnyObj | null | undefined): Date | null => {
  if (!obj) return null;
  for (const path of DATE_KEY_PATHS) {
    const dt = coerceDate(getByPath(obj, path));
    if (dt) return dt;
  }
  return null;
};

const isCurrentMonth = (dt: Date): boolean => {
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
};

// Resolves a price date for a child (variant). If the child has no date, fall back to parent (product) date.
const resolvePriceDate = (child: AnyObj | null | undefined, parent: AnyObj | null | undefined): Date | null => {
  const childDate = pickDateFrom(child ?? null);
  if (childDate) return childDate;
  return pickDateFrom(parent ?? null);
};

const shouldShowPrice = (target: AnyObj, parent?: AnyObj): boolean => {
  const dt = resolvePriceDate(target, parent);
  return !!dt && isCurrentMonth(dt);
};

// helper para armar el link
const buildWhatsAppLink = (productName: string) => {
  const base = 'https://wa.me/5215581631195';
  const text = `Hola, quiero informes sobre: ${productName}`;
  return `${base}?text=${encodeURIComponent(text)}`;
};

const Info: React.FC<InfoProps> = ({ data }) => {
  const showBasePrice = shouldShowPrice(data as unknown as AnyObj);

  // variante visible si su fecha es del mes, o si no tiene fecha propia pero el producto sí (y es del mes)
  const visibleVariants = (data.variants ?? []).filter((v) => shouldShowPrice(v as unknown as AnyObj, data as unknown as AnyObj));

  return (
    <div>
      <h1 className='max-[760px]:text-xl max-[1023px]:text-2xl text-3xl font-bold mb-8'>{data.name}</h1>

      <div className='mt-2 flex flex-col gap-y-4 max-w-[800px] mx-auto'>
        {/* Precio base (se oculta si no es del mes actual) */}
        {showBasePrice && (
          <div className='flex flex-col items-start mb-3'>
            <p className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold'>Precio base:</p>

            <div className='flex gap-x-3'>
              {data.promoPrice != null && Number(data.promoPrice) < Number(data.price) ? (
                <>
                  <span className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold line-through text-gray-500'>
                    <Currency value={data.price} />
                  </span>
                  <span className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold text-red-600'>
                    <Currency value={data.promoPrice} />
                  </span>
                </>
              ) : (
                <p className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold'>
                  <Currency value={data.price} />
                </p>
              )}
            </div>
          </div>
        )}

        {/* separador sólo si hay base y variantes visibles */}
        {showBasePrice && visibleVariants.length > 0 && <hr className='border-gray-700 mb-2' />}

        {/* Variantes */}
        {visibleVariants.map((variant, i) => (
          <React.Fragment key={variant._id ?? `${variant.name}-${i}`}>
            <div className='flex flex-col items-start'>
              <p className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold'>{variant.name}:</p>

              <div className='flex gap-x-3'>
                {variant.promoPrice != null && Number(variant.promoPrice) < Number(variant.price) ? (
                  <>
                    <span className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold line-through text-gray-500'>
                      <Currency value={variant.price} />
                    </span>
                    <span className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold text-red-600'>
                      <Currency value={variant.promoPrice} />
                    </span>
                  </>
                ) : (
                  <p className='text-xl max-[600px]:text-sm max-[1278px]:text-lg font-bold'>
                    <Currency value={variant.price} />
                  </p>
                )}
              </div>
            </div>

            {i < visibleVariants.length - 1 && <hr className='my-2 border-gray-700' />}
          </React.Fragment>
        ))}
      </div>

      {/* contenedor centrado */}
      <div className='mt-10 flex flex-wrap justify-center items-center gap-x-3 gap-y-2'>
        <a
          href={buildWhatsAppLink(data.name)}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Contactar por WhatsApp para informes'
          className='inline-flex items-center justify-center gap-x-2 rounded-full bg-green-600 px-6 py-2 text-lg font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700'>
          <FaWhatsapp
            aria-hidden='true'
            size={22}
            className='flex-shrink-0'
          />
          Apártalo / Informes
        </a>

        {data.specPdfUrl && (
          <Link
            href={data.specPdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Ver ficha técnica en PDF'
            className='inline-flex items-center justify-center gap-x-2 rounded-full bg-black px-6 py-2 text-lg font-semibold text-white transition-all duration-150 hover:brightness-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'>
            Ver ficha técnica
          </Link>
        )}
      </div>
    </div>
  );
};

export default Info;
