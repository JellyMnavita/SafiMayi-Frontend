import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Button,
  Menu,
  MenuList,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  Pagination,
  FormControl,
  CircularProgress,
  Grid,
  InputLabel,
  Alert,
  Snackbar,
  Chip
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface User {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  role: string;
  state: boolean;
}

interface PaginatedResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: User[];
}

export function UserView() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search + Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Menu contextuel
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog (create/edit)
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<User & { password: string }>>({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Charger utilisateurs avec pagination et filtres
  const fetchUsers = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (stateFilter !== '') params.append('state', stateFilter);

      const res = await apiClient.get<PaginatedResponse>(
        `/api/users/list/?${params.toString()}`
      );

      setUsers(res.data.results);
      setTotalCount(res.data.count);
      setTotalPages(res.data.total_pages);
      setPage(res.data.page);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [pageSize, searchTerm, roleFilter, stateFilter]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, stateFilter, pageSize]);

  // Menu actions
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Gestionnaire pour les champs TextField
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestionnaire spécifique pour les Select
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save (create/update)
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError("");
      // Validation des champs requis
      if (!formData.nom || !formData.email || !formData.telephone || !formData.role) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Pour la création, vérifier le mot de passe
      if (!formData.id && !formData.password) {
        setError("Le mot de passe est requis pour la création");
        return;
      }

      if (formData.id) {
        // Modification - utiliser PUT pour la mise à jour complète
        await apiClient.put(
          `/api/users/${formData.id}/`,
          formData
        );
        setSuccessMessage("Utilisateur modifié avec succès");
      } else {
        // Création
        await apiClient.post(
          "/api/users/create-list/",
          formData
        );
        setSuccessMessage("Utilisateur créé avec succès");
      }

      fetchUsers(page);
      setOpenDialog(false);
      setFormData({});
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde :", error);
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        "Erreur lors de la sauvegarde";
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async () => {
    try {
      if (!selectedUser) return;

      await apiClient.delete(
        `/api/users/${selectedUser.id}/`
      );

      setSuccessMessage("Utilisateur désactivé avec succès");
      fetchUsers(page);
      handleMenuClose();
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error);
      setError(error.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  // Activer/Désactiver un utilisateur
  const handleToggleStatus = async () => {
    try {
      if (!selectedUser) return;

      const newState = !selectedUser.state;

      await apiClient.patch(
        `/api/users/${selectedUser.id}/`,
        { state: newState }
      );

      setSuccessMessage(`Utilisateur ${newState ? "activé" : "désactivé"} avec succès`);
      fetchUsers(page);
      handleMenuClose();
    } catch (error: any) {
      console.error("Erreur lors du changement de statut :", error);
      setError(error.response?.data?.detail || "Erreur lors du changement de statut");
    }
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStateFilter("");
    setPage(1);
  };

  // Changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchUsers(value);
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      'client': 'Client',
      'admin': 'Administrateur',
      'agent': 'Agent Commercial',
      'gerant': 'Gérant',
      'owner': 'Propriétaire'
    };
    return roles[role] || role;
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Utilisateurs ({totalCount})
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setOpenDialog(true);
            setError("");
          }}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      {/* Filtres optimisés */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Ligne principale - Filtres essentiels */}
          <Box sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            {/* Recherche principale */}
            <TextField
              label="Rechercher un utilisateur"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Nom, email, téléphone..."
              sx={{ minWidth: 250, flexGrow: 1 }}
            />

            {/* Filtres rapides */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={roleFilter}
                  label="Rôle"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="gerant">Gérant</MenuItem>
                  <MenuItem value="owner">Propriétaire</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={stateFilter}
                  label="Statut"
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Actif</MenuItem>
                  <MenuItem value="false">Inactif</MenuItem>
                </Select>
              </FormControl>

              {/* Bouton filtres avancés */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list"} />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {showAdvancedFilters ? "Masquer" : "Plus de filtres"}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Réinitialiser
              </Button>
            </Box>
          </Box>

          {/* Filtres avancés - conditionnel */}
          {showAdvancedFilters && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              {/* Sélection du nombre d'éléments par page */}
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Par page</InputLabel>
                <Select
                  value={pageSize}
                  label="Par page"
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Indicateur de filtres actifs */}
          {(roleFilter || stateFilter) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                Filtres actifs:
              </Typography>
              {roleFilter && (
                <Chip
                  size="small"
                  label={`Rôle: ${getRoleLabel(roleFilter)}`}
                  onDelete={() => setRoleFilter("")}
                />
              )}
              {stateFilter && (
                <Chip
                  size="small"
                  label={`Statut: ${stateFilter === "true" ? "Actif" : "Inactif"}`}
                  onDelete={() => setStateFilter("")}
                />
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* Pagination en haut */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {page} sur {totalPages}
            ({totalCount} utilisateurs au total)
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Tableau - VERSION RESPONSIVE CORRIGÉE */}
      <Card>
        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Conteneur scrollable pour les petits écrans */}
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Box sx={{ minWidth: 700 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Nom</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Email</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Téléphone</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Rôle</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>Statut</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="table-row"
                            onClick={() => {
                              setFormData(user);
                              setOpenDialog(true);
                              setError("");
                            }}
                          >
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.nom}
                                </Typography>
                              </Box>
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              <Typography variant="body2">
                                {user.email}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {user.telephone ? (
                                <Typography variant="body2">
                                  {user.telephone}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              <Chip
                                label={getRoleLabel(user.role)}
                                size="small"
                                variant="outlined"
                                color={
                                  user.role === 'admin' ? 'error' :
                                    user.role === 'owner' ? 'warning' :
                                      user.role === 'agent' ? 'info' :
                                        user.role === 'gerant' ? 'secondary' : 'default'
                                }
                              />
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {user.state ? (
                                <Chip
                                  label="Actif"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                />
                              ) : (
                                <Chip
                                  label="Inactif"
                                  size="small"
                                  color="error"
                                  variant="filled"
                                />
                              )}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMenuOpen(e, user);
                                }}
                                size="small"
                              >
                                <Iconify icon="eva:more-vertical-fill" />
                              </IconButton>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280', padding: '24px' }}>
                            <Typography variant="h6" color="text.secondary">
                              Aucun utilisateur trouvé
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Essayez de modifier vos critères de recherche
                            </Typography>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Box>
              </Box>

              {/* Pagination en bas */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  flexWrap: "wrap",
                  gap: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {`Affichage de ${users.length} sur ${totalCount} utilisateurs`}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              setFormData(selectedUser || {});
              setOpenDialog(true);
              setError("");
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItem>
          <MenuItem
            onClick={handleToggleStatus}
          >
            {selectedUser?.state ? "Désactiver" : "Activer"}
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{ color: "error.main" }}
          >
            Supprimer
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                label="Nom complet"
                name="nom"
                value={formData.nom || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                label="Téléphone"
                name="telephone"
                value={formData.telephone || ""}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            {!formData.id && (
              <Grid sx={{ width: '100%' }} >
                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password || ""}
                  onChange={handleInputChange}
                  fullWidth
                  required={!formData.id}
                />
              </Grid>
            )}
            <Grid sx={{ width: '100%' }} >
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role || "client"}
                  label="Rôle"
                  onChange={(e) => handleSelectChange("role", e.target.value as string)}
                  required
                >
                  <MenuItem value="client">Client</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent Commercial</MenuItem>
                  <MenuItem value="gerant">Gérant</MenuItem>
                  <MenuItem value="owner">Propriétaire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={saveLoading}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveLoading}
            startIcon={saveLoading ? <CircularProgress size={16} /> : null}
          >
            {saveLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}