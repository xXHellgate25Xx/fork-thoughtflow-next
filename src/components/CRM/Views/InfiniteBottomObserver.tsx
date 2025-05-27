import { useEffect, useRef } from 'react';
import type { ColumnDef } from './DynamicTable';

interface LoadMoreObserverProps {
    onIntersect: () => void;
    loading: boolean;
    columns: ColumnDef<any>[];
}

export const LoadMoreObserver = ({ onIntersect, loading, columns }: LoadMoreObserverProps) => {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loading) {
                    onIntersect();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [onIntersect, loading]);

    return (
        <tr>
            <td colSpan={columns.length}>
                <div ref={observerRef} className="h-0 w-full" />
            </td>
        </tr>
    );
};

interface RenderLoadingSkeletonRowsProps {
    columns: ColumnDef<any>[];
    count?: number;
}

export const RenderLoadingSkeletonRows = ({ columns, count = 10 }: RenderLoadingSkeletonRowsProps) => (
    Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {columns.map((column, cellIndex) => (
                <td
                    key={cellIndex}
                    className="py-3 px-2 border-gray-200"
                    style={{
                        width: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                        maxWidth: `var(--col-${cellIndex}-width, ${column.width || 150}px)`,
                    }}
                >
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </td>
            ))}
        </tr>
    ))
);

interface InfiniteBottomObserverProps {
    hasMore: boolean;
    loading: boolean;
    columns: ColumnDef<any>[];
    onLoadMore: () => void;
    totalRecords: number;
}

export const InfiniteBottomObserver = ({
    hasMore,
    loading,
    columns,
    onLoadMore,
    totalRecords,
}: InfiniteBottomObserverProps) => (
    <>
        {hasMore && totalRecords > 0 ? <LoadMoreObserver onIntersect={onLoadMore} loading={loading} columns={columns} /> : null}
        {hasMore || loading ? <RenderLoadingSkeletonRows columns={columns} /> : null}
        {!hasMore && !loading && totalRecords > 0 && (
            <tr className="text-center text-gray-500 text-sm">
                <td className="py-4" colSpan={columns.length}>
                    All data loaded ({totalRecords} records)
                </td>
            </tr>
        )}
    </>
);

export default InfiniteBottomObserver; 