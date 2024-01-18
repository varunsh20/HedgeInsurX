import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext(0);

export const TabsProvider = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);

    const changeTab = (index) => {
        setActiveTab(index);
    };

    return (
        <TabsContext.Provider value={{ activeTab, changeTab }}>
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("useTabs must be used within a TabsProvider");
    }
    return context;
};
