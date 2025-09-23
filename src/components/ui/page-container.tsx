import { ReactNode } from "react";

type PageContainerProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function PageContainer({ title, description, children, className }: PageContainerProps) {
  return (
    <div className={"flex-1 p-6 md:p-8 " + (className ?? "")}> 
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {(title || description) && (
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-base md:text-lg text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}


