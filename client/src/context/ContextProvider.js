// import React from "react";
// import { AuthProvider } from "./AuthContext";
// import { UserProvider } from "./UserContext";
// import { BoardProvider } from "./BoardContext";

// const ContextProvider = ({ children }) => {
//     return (
//         <AuthProvider>
//             <UserProvider>
//                 <BoardProvider>
//                     {children}
//                 </BoardProvider>
//             </UserProvider>
//         </AuthProvider>
//     );
// };

// export default ContextProvider;

import React from "react";
import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { BoardProvider } from "./BoardContext";
import { ListProvider } from "./ListContext";
import { CardProvider } from "./CardContext";
import { ConversationProvider } from "./ConversationContext";
import { NotificationProvider } from "./NotifiacationContext";
import { SearchProvider } from "./SearchContext";

const ContextProvider = ({ children }) => {
    return (
        <UserProvider>
            <AuthProvider>
                <NotificationProvider>
                    <BoardProvider>
                        <SearchProvider> 
                            <ConversationProvider>
                                <ListProvider>
                                    <CardProvider>
                                        {children}
                                    </CardProvider>
                                </ListProvider>
                            </ConversationProvider>
                        </SearchProvider> 
                    </BoardProvider>
                </NotificationProvider>
            </AuthProvider>
        </UserProvider>
    );
};

export default ContextProvider;
