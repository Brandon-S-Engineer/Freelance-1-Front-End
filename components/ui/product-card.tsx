'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import Currency from '@/components/ui/currency';

interface ProductCard {
  data: Product;
}

type DateLike = string | number | Date | null | undefined;

const coerceDate = (val: DateLike): Date | null => {
  if (val == null) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

const CANDIDATE_PRICE_DATE_KEYS = ['priceUpdatedAt', 'priceAt', 'priceDate', 'updatedAt', 'createdAt', 'syncedAt'] as const;

const getPriceDate = (p: Product): Date | null => {
  for (const key of CANDIDATE_PRICE_DATE_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (p as any)?.[key];
    const dt = coerceDate(val);
    if (dt) return dt;
  }
  return null;
};

const isCurrentMonth = (dt: Date): boolean => {
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
};

const ProductCard: React.FC<ProductCard> = ({ data }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  };

  // 👉 Only show price if we can find a timestamp that is in the current month
  const priceDate = getPriceDate(data);
  const shouldShowPrice = !!priceDate && isCurrentMonth(priceDate);

  const firstImage = data?.images && data.images.length > 0 ? (typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url) : 'https://via.placeholder.com/300';

  return (
    <div
      onClick={handleClick}
      className='bg-white group cursor-pointer rounded-xl border p-3 space-y-4'>
      {/* Images and Icons */}
      <div className='rounded-xl bg-gray-100 relative'>
        <Image
          src={firstImage}
          alt='Image'
          width={400}
          height={250}
          className='w-full h-auto object-contain rounded-md'
        />
      </div>

      {/* Description */}
      <div>
        <p className='font-semibold text-lg'>{data.name}</p>
        <p className='text-sm text-gray-500'>{data.category?.name}</p>
      </div>

      {/* Price (hidden if timestamp is from a past month or missing) */}
      {shouldShowPrice && (
        <div className='flex items-center space-x-2'>
          {data?.promoPrice != null && Number(data.promoPrice) < Number(data.price) ? (
            <>
              <span className='text-gray-500 line-through'>
                <Currency value={data.price} />
              </span>
              <span className='text-red-600 font-semibold'>
                <Currency value={data.promoPrice} />
              </span>
            </>
          ) : (
            <>
              <span className='text-gray-600 mr-1'>desde</span>
              <Currency value={data.price} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;

// 'use client';

// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { Product } from '@/types';
// import Currency from '@/components/ui/currency';

// interface ProductCard {
//   data: Product;
// }

// const ProductCard: React.FC<ProductCard> = ({ data }) => {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push(`/product/${data?.id}`);
//   };

//   return (
//     <div
//       onClick={handleClick}
//       className='bg-white group cursor-pointer rounded-xl border p-3 space-y-4'>
//       {/* Images and Icons */}
//       <div className='rounded-xl bg-gray-100 relative'>
//         <Image
//           src={data?.images && data.images.length > 0 ? (typeof data.images[0] === 'string' ? data.images[0] : data.images[0].url) : 'https://via.placeholder.com/300'}
//           alt='Image'
//           width={400}
//           height={250}
//           className='w-full h-auto object-contain rounded-md'
//         />
//       </div>

//       {/* Description */}
//       <div>
//         <p className='font-semibold text-lg'>{data.name}</p>

//         <p className='text-sm text-gray-500'>{data.category?.name}</p>
//       </div>

//       {/* Price */}

//       <div className='flex items-center space-x-2'>
//         {data?.promoPrice != null && data.promoPrice < data.price ? (
//           <>
//             <span className='text-gray-500 line-through'>
//               <Currency value={data.price} />
//             </span>
//             <span className='text-red-600 font-semibold'>
//               <Currency value={data.promoPrice} />
//             </span>
//           </>
//         ) : (
//           <>
//             <span className='text-gray-600 mr-1'>desde</span>
//             <Currency value={data.price} />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
