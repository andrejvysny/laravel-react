import React from 'react';
import { Button } from '@/components/ui/button';



function PageHeader({title, buttons}: {title: string, buttons: {onClick: () => void, label: string}[]}) {
    return (

            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-2xl mb-0">{title}</h1>
                <div>
                    {
                        buttons.map((button, index) => {
                            return (
                                <Button
                                    key={button.label}
                                    onClick={button.onClick}
                                    className={index != buttons.length ? 'mr-2' : ''}
                                >
                                    {button.label}
                                </Button>
                            );
                        })
                    }
                </div>
            </div>
    );
}

export default PageHeader;
