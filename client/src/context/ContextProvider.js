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

const ContextProvider = ({ children }) => {
    return (
        <UserProvider>
            <AuthProvider>
                <BoardProvider>
                    <ListProvider>
                        <CardProvider>{children}</CardProvider>
                    </ListProvider>
                </BoardProvider>
            </AuthProvider>
        </UserProvider>
    );
};

export default ContextProvider;
