import { Product } from '@/types';

const URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

const getProduct = async (id: string): Promise<Product> => {
  const res = await fetch(`${URL}/${id}`, { cache: 'no-store' });
  const data = await res.json();

  return {
    ...data,
    promoPrice: data.promoPrice ?? null, // ✅ incluir el precio promocional
    images: data.images.map((url: string, index: number) => ({
      id: `img-${index}`,
      url,
    })),
    variants: Array.isArray(data.variants) ? data.variants : [],
  };
};

export default getProduct;
