import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  PlaylistPlay as PlaylistIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [systemStats, setSystemStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, currentTab]);

  const checkAdminAccess = async () => {
    try {
      const adminAccess = await adminService.checkAdminAccess(user.id);
      setIsAdmin(adminAccess);
      if (!adminAccess) {
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (currentTab === 0) {
        // Load system stats
        const stats = await adminService.getSystemStats(user.id);
        setSystemStats(stats);
      } else if (currentTab === 1) {
        // Load users
        const usersData = await adminService.getAllUsers(user.id, page, 10);
        setUsers(usersData.content || []);
        setTotalPages(usersData.totalPages || 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  const handleUserAction = async (action, userId, additionalData = {}) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      switch (action) {
        case 'updateRole':
          await adminService.updateUserRole(userId, additionalData.role, currentUser.id);
          toast.success('User role updated successfully');
          break;
        case 'delete':
          await adminService.deleteUser(userId, currentUser.id);
          toast.success('User deleted successfully');
          // Remove user from local state
          setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          break;
        default:
          console.warn('Unknown action:', action);
      }
      
      // Refresh data for all actions except delete (since we already updated the state)
      if (action !== 'delete') {
        await loadDashboardData();
      }
      
      // Close dialogs
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleContentDelete = async (type, id) => {
    try {
      if (type === 'track') {
        await adminService.deleteTrack(id, user.id);
        toast.success('Track deleted successfully');
      } else if (type === 'playlist') {
        await adminService.deletePlaylist(id, user.id);
        toast.success('Playlist deleted successfully');
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const renderSystemStats = () => (
    <Grid container spacing={3}>
      {/* Overview Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{systemStats?.totalUsers || 0}</Typography>
                <Typography color="textSecondary">Total Users</Typography>
                <Typography variant="body2" color="success.main">
                  +{systemStats?.newUsersThisWeek || 0} this week
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <MusicNoteIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{systemStats?.totalTracks || 0}</Typography>
                <Typography color="textSecondary">Total Tracks</Typography>
                <Typography variant="body2" color="success.main">
                  +{systemStats?.newTracksThisWeek || 0} this week
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <PlaylistIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{systemStats?.totalPlaylists || 0}</Typography>
                <Typography color="textSecondary">Total Playlists</Typography>
                <Typography variant="body2" color="success.main">
                  +{systemStats?.newPlaylistsThisWeek || 0} this week
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUpIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
              <Box>
                <Typography variant="h4">{systemStats?.totalListeningHistory || 0}</Typography>
                <Typography color="textSecondary">Total Plays</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Lists */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Top Tracks" />
          <CardContent>
            <List dense>
              {systemStats?.topTracks?.slice(0, 5).map((track, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={track.name}
                    secondary={`${track.additionalInfo} - ${track.count} plays`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Top Artists" />
          <CardContent>
            <List dense>
              {systemStats?.topArtists?.slice(0, 5).map((artist, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={artist.name}
                    secondary={`${artist.count} total plays - ${artist.additionalInfo}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Top Genres" />
          <CardContent>
            <List dense>
              {systemStats?.topGenres?.slice(0, 5).map((genre, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={genre.name}
                    secondary={`${genre.count} tracks`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUserManagement = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">User Management</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Tracks</TableCell>
              <TableCell>Playlists</TableCell>
              <TableCell>Followers</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === 'ADMIN' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.tracksCount}</TableCell>
                <TableCell>{user.playlistsCount}</TableCell>
                <TableCell>{user.followersCount}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role);
                      setUserDialogOpen(true);
                    }}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                        handleUserAction('delete', user.id);
                      }
                    }}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (!user) {
    return (
      <Container>
        <Alert severity="error">Please log in to access the admin dashboard.</Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="System Overview" icon={<DashboardIcon />} />
          <Tab label="User Management" icon={<PeopleIcon />} />
          <Tab label="Content Management" icon={<MusicNoteIcon />} />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 0 && renderSystemStats()}
          {currentTab === 1 && renderUserManagement()}
          {currentTab === 2 && (
            <Typography variant="h6">Content Management - Coming Soon</Typography>
          )}
        </>
      )}

      {/* User Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)}>
        <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handleUserAction('updateRole', selectedUser?.id, { role: newRole })}
            variant="contained"
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 