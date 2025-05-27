import React from 'react';

interface PanelWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: React.ReactNode;
}

const PanelWrapper: React.FC<PanelWrapperProps> = ({ className = '', children, ...rest }) =>
    <div className={`flex flex-col h-full ${className}`} {...rest}>
        <div className="flex-1 overflow-auto">
            {children}
        </div>
    </div>

export default PanelWrapper; 