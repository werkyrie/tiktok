import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Save client data
export async function saveClient(clientData) {
    try {
        const docRef = await addDoc(collection(db, "clients"), clientData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding client: ", error);
        throw error;
    }
}

// Update client data
export async function updateClient(clientId, clientData) {
    try {
        await updateDoc(doc(db, "clients", clientId), clientData);
    } catch (error) {
        console.error("Error updating client: ", error);
        throw error;
    }
}

// Delete client
export async function deleteClient(clientId) {
    try {
        await deleteDoc(doc(db, "clients", clientId));
    } catch (error) {
        console.error("Error deleting client: ", error);
        throw error;
    }
}

// Get all clients
export async function getAllClients() {
    try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting clients: ", error);
        throw error;
    }
}

// Get clients by agent
export async function getClientsByAgent(agentName) {
    try {
        const q = query(collection(db, "clients"), where("agent", "==", agentName));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting clients by agent: ", error);
        throw error;
    }
}