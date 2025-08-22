import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
} from "@mui/material";
import { Icon } from "@iconify/react";

interface User {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  role: string;
  state: boolean;
}

export function UserView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog (create/edit)
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://safimayi-backend.onrender.com/api/users/create-list/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (formData.id) {
        // Edition
        await axios.put(
          `https://safimayi-backend.onrender.com/api/users/${formData.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Création
        await axios.post(
          "https://safimayi-backend.onrender.com/api/users/",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchUsers();
      setOpenDialog(false);
      setFormData({});
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.telephone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setOpenDialog(true);
          }}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      {/* Table */}
      <Card sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search user..."
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        {loading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-left text-sm">
                  <th className="p-2">Nom</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Téléphone</th>
                  <th className="p-2">Rôle</th>
                  <th className="p-2">Vérifié</th>
                  <th className="p-2">Statut</th>
                  <th className="p-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-2 font-medium">{user.nom}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.telephone}</td>
                    <td className="p-2 capitalize">{user.role}</td>
                    <td className="p-2">
                      {user.state ? (
                        <Icon
                          icon="mdi:check-circle"
                          className="text-green-500"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      {user.state ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          Banni
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                        <Icon icon="mdi:dots-vertical" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setFormData(selectedUser || {});
            setOpenDialog(true);
            handleMenuClose();
          }}
        >
          Modifier
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("TODO: delete user", selectedUser);
            handleMenuClose();
          }}
        >
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog Ajout / Edition */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {formData.id ? "Modifier l’utilisateur" : "Nouvel utilisateur"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Nom"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            fullWidth
          />
          <TextField
            label="Téléphone"
            value={formData.telephone || ""}
            onChange={(e) =>
              setFormData({ ...formData, telephone: e.target.value })
            }
            fullWidth
          />
          <Select
            value={formData.role || "client"}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="client">Client</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
