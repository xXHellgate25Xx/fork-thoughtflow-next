import { Outlet } from "react-router-dom";

type BreadcrumbItem = {
    label: string;
    href?: string;
}

type CRMPageHeaderProps = {
    title?: string; // Keep for backward compatibility
    breadcrumbs?: BreadcrumbItem[];
    airtableLink: string;
    children: React.ReactNode;
}

export default function CRMPageHeader({ title, breadcrumbs, airtableLink, children }: CRMPageHeaderProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-bold">
                    {breadcrumbs ? (
                        <div className="flex items-center space-x-3">
                            {breadcrumbs.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    {item.href ? (
                                        <a href={item.href} className="hover:text-primary transition-colors">
                                            {item.label}
                                        </a>
                                    ) : (
                                        <span>{item.label}</span>
                                    )}
                                    {index < breadcrumbs.length - 1 && (
                                        <span className="text-gray-400">/</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        title
                    )}
                </div>
                <a href={airtableLink} target="_blank" rel="noopener noreferrer" className="no-underline">
                    <button 
                        type="button" 
                        className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/80 transition-colors font-medium text-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Yellow top parallelogram */}
                            <path d="M20 35 L50 20 L80 35 L50 50 Z" fill="#FCB400"/>
                            {/* Turquoise side parallelogram */}
                            <path d="M50 50 L80 35 L80 65 L50 80 Z" fill="#18BFFF"/>
                            {/* Red/pink triangle */}
                            <path d="M20 35 L50 50 L50 80 L20 65 Z" fill="#F82B60"/>
                        </svg>
                        Open in Airtable
                    </button>
                </a>
            </div>
            <div className="border-b border-gray-200 mb-4" />
            {children}
        </div>
    )
}