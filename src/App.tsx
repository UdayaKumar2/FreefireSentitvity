/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useState } from 'react';
import {
  Grid, Paper, Autocomplete, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
  useMediaQuery, useTheme, Snackbar, Alert, Box, Divider,
  Grow
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import './index.css';
import devicesData from './assets/devices.json';
import brandsData from './assets/brands.json';
import socialsData from './assets/socials.json';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Android, Apple, EmojiEvents, MilitaryTech, Phone, PhoneIphone } from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';
// import vidsrc from './assets/BgVid.mp4'

interface BrandJsonRecord {
  id: string;
  name: string;
}
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Grow ref={ref} {...props} />;
});
interface DeviceJsonRecord {
  id: string;
  url_hash: string;
  brand_id: string;
  name: string;
  picture: string;
  released_at: string;
  body: string;
  os: string;
  storage: string;
  display_size: string;
  display_resolution: string;
  camera_pixels: string;
  video_pixels: string;
  ram: string;
  chipset: string;
  battery_size: string;
  battery_type: string;
  specifications: string;
  deleted_at: string;
  created_at: string;
  updated_at: string;
}

interface BrandOption {
  label: string;
  id: number;
}

interface DeviceRecord extends DeviceJsonRecord {
  label?: string;
}

interface SensitivityData {
  General: number | string;
  redDot: number | string;
  TwoX: number | string;
  FourX: number | string;
  FreeLook: number | string;
  FireButtonSize: number | string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

const brands: { RECORDS: BrandJsonRecord[] } = brandsData;
const typedDevicesData = devicesData as { RECORDS: DeviceJsonRecord[] };

const devices: { RECORDS: DeviceJsonRecord[] } = {
  RECORDS: typedDevicesData.RECORDS
};
function App() {
  const [brand, setBrand] = useState<BrandOption | null>(null);
  const [device, setDevice] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'info' });
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceRecord[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<string[]>([]);
  const [sensitivityData, setSensitivityData] = useState<SensitivityData | null>(null);
  const [cachedSensitivity, setCachedSensitivity] = useState<{ [key: string]: SensitivityData }>({});
  const [cooldown, setCooldown] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const brandList: any = brands.RECORDS.map((b) => ({ label: b.name, id: b.id }));
    setBrandOptions(brandList);

    const cooldownUntil = localStorage.getItem('cooldown_until');
    if (cooldownUntil) {
      const timeLeft = parseInt(cooldownUntil) - Date.now();
      if (timeLeft > 0) startCooldown(timeLeft);
    }
  }, []);
  const getSocialIcon = (name: string) => {
    switch (name) {
      case 'Instagram': return <InstagramIcon style={{
        color: 'black',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f57c00'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'black'}
        fontSize="small" sx={{ mr: 1, color: '#E1306C' }} />;
      case 'YouTube': return <YouTubeIcon style={{
        color: 'black',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'black'}
        fontSize="small" sx={{ mr: 1, color: '#FF0000' }} />;
      case 'GitHub': return <GitHubIcon style={{
        color: 'black',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'black'}
        fontSize="small" sx={{ mr: 1, color: '#333' }} />;
      default: return null;
    }
  };

  useEffect(() => {
    if (!brand) {
      setFilteredDevices([]);
      setDeviceOptions([]);
      setDevice(null);
      return;
    }
    const matchingDevices = devices.RECORDS
      .filter((d) => Number(d.brand_id) === Number(brand.id))
      .map((d) => ({ ...d, label: d.name }));
    setFilteredDevices(matchingDevices);
    setDeviceOptions(matchingDevices.map(d => d.label || ''));
    setDevice(null);
  }, [brand]);

  const startCooldown = (time: number = 2 * 60 * 1000) => {
    const end = Date.now() + time;
    localStorage.setItem('cooldown_until', end.toString());
    const interval = setInterval(() => {
      const remaining = end - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setCooldown(0);
        localStorage.removeItem('cooldown_until');
        localStorage.removeItem('device_history');
        setSnackbar({ open: true, message: 'Cooldown ended. You can add new devices now.', severity: 'info' });
      } else {
        setCooldown(Math.ceil(remaining / 1000));
      }
    }, 1000);
  };

  const handleClickOpen = () => {
    if (!brand || !device || !mode) {
      setSnackbar({ open: true, message: 'Please select brand, device, and game mode.', severity: 'warning' });
      return;
    }
    const userHistory = JSON.parse(localStorage.getItem('device_history') || '[]');

    //if (!userHistory.includes(device)) {
      if (userHistory.length >= 10) {
        setSnackbar({ open: true, message: 'Limit reached. Please wait 5 minutes to add new device.', severity: 'error' });
        startCooldown();
        return;
      }
      userHistory.push(device);
      localStorage.setItem('device_history', JSON.stringify(userHistory));
    //}
    const cached = cachedSensitivity[device];
    if (cached) {
      setSensitivityData(cached);
    } else {
      const data = getSensitivityData(device);
      setSensitivityData(data);
      setCachedSensitivity(prev => ({ ...prev, [device]: data }));
    }
    setOpen(true);
  };

  const getSensitivityData = (selectedDevice: string | null): SensitivityData => {
    const deviceInfo = filteredDevices.find(d => d.label === selectedDevice);
    if (!deviceInfo) return defaultSensitivity();
    const os = (deviceInfo.os || '').toLowerCase();
    const release = deviceInfo.released_at || '';
    if (os.includes('feature') || os.includes('kaios')) return lowEnd();
    if (os.includes('android') && release.includes('2015')) return midRange();
    if (os.includes('android') || os.includes('ios')) return highEnd();
    return defaultSensitivity();
  };

  const defaultSensitivity = (): SensitivityData => ({ General: '-', redDot: '-', TwoX: '-', FourX: '-', FreeLook: '-', FireButtonSize: '-' });
  const randomSensitivity = (base: number): number => Math.round(Math.random() * (Math.min(base + 5, 200) - base) + base);
  const lowEnd = (): SensitivityData => ({ General: randomSensitivity(170), redDot: randomSensitivity(160), TwoX: randomSensitivity(150), FourX: randomSensitivity(140), FreeLook: randomSensitivity(130), FireButtonSize: 43 });
  const midRange = (): SensitivityData => ({ General: randomSensitivity(180), redDot: randomSensitivity(170), TwoX: randomSensitivity(160), FourX: randomSensitivity(150), FreeLook: randomSensitivity(140), FireButtonSize: 41 });
  const highEnd = (): SensitivityData => ({ General: randomSensitivity(190), redDot: randomSensitivity(180), TwoX: randomSensitivity(170), FourX: randomSensitivity(160), FreeLook: randomSensitivity(150), FireButtonSize: 40 });

  return (
    <>
      {/* <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,

        }}
      >
        <source src={vidsrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}

      <Box
        className="bg-gradient-to-br from-black to-gray-900 min-h-screen text-white"
        px={isMobile ? 2 : 4}
        py={isMobile ? 2 : 4}
        sx={{
          position: 'relative',
          zIndex: 1,
          height:'100%',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Grid container justifyContent="center" height="100%" alignContent="center">
          <Grid size={{ xs: 12, sm: 10, md: 6, lg: 4 }}>
            <Paper
              elevation={10}
              sx={{
                borderRadius: 4,
                p: isMobile ? 2 : 4,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 12, // optional: elevate more on hover
                },
                animation: 'squeezeIn 0.5s ease-out',
                '@keyframes squeezeIn': {
                  '0%': { transform: 'scale(0.8)', opacity: 0 },
                  '50%': { transform: 'scale(1.05)', opacity: 1 },
                  '100%': { transform: 'scale(1)', opacity: 1 },
                },
              }}
            >
              <Typography variant={isMobile ? "h5" : "h4"} align="center" fontWeight={700} gutterBottom>
                <SportsEsportsIcon sx={{ fontSize: isMobile ? 24 : 36, mr: 1 }} />
                FF Sensitivity Zone
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography align="center" color="orange" fontSize={16} sx={{ mb: 2,    textShadow: '1px 1px 1px rgba(0, 0, 0, 0.7)' }}>
                Create perfect settings for epic gameplay
              </Typography>

              {cooldown > 0 && (
                <Typography
                  align="center"
                  color="error.main"
                  fontWeight={600}
                  sx={{
                    mb: 2,
                    animation: 'blinker 1.2s linear infinite',
                    '@keyframes blinker': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    }
                  }}
                >
                  Cooldown active: wait {cooldown}s
                </Typography>
              )}

              <Autocomplete
                value={brand}
                onChange={(_, newValue) => setBrand(newValue)}
                options={brandOptions}
                getOptionLabel={(o) => o?.label || ''}
                disabled={cooldown > 0}
                renderOption={(props, option) => {
                  let icon = <PhoneIphone sx={{ mr: 1 }} />;
                  if (option.label.toLowerCase().includes('apple')) icon = <Apple sx={{ mr: 1 }} />;
                  else if (option.label.toLowerCase().includes('samsung')) icon = <Phone sx={{ mr: 1 }} />;
                  else if (option.label.toLowerCase().includes('android')) icon = <Android sx={{ mr: 1 }} />;

                  return (
                    <li {...props}>
                      <Box display="flex" alignItems="center">
                        {icon}
                        {option.label}
                      </Box>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Brand" variant="outlined" fullWidth sx={{ mb: 2 }} required color='warning' />
                )}
              />

              <Autocomplete
                value={device}
                onChange={(_, newValue) => setDevice(newValue)}
                options={deviceOptions}
                getOptionLabel={(o) => o || ''}
                disabled={!brand || cooldown > 0}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box display="flex" alignItems="center">
                      <PhoneIphone sx={{ mr: 1 }} />
                      {option}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Device Model" variant="outlined" fullWidth sx={{ mb: 2 }} required color='warning' />
                )}
              />

              <Autocomplete
                value={mode}
                onChange={(_, newValue) => setMode(newValue)}
                options={['Classic Mode', 'Ranked Mode', 'Clash Squad']}
                disabled={cooldown > 0}
                renderOption={(props, option) => {
                  let icon = <SportsEsportsIcon sx={{ mr: 1 }} />;
                  if (option === 'Ranked Mode') icon = <EmojiEvents sx={{ mr: 1 }} />;
                  else if (option === 'Clash Squad') icon = <MilitaryTech sx={{ mr: 1 }} />;

                  return (
                    <li {...props}>
                      <Box display="flex" alignItems="center">
                        {icon}
                        {option}
                      </Box>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Game Mode" variant="outlined" fullWidth sx={{ mb: 2 }} required color='warning' />
                )}
              />

              <Button
                onClick={handleClickOpen}
                variant="contained"
                fullWidth
                color="warning"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                disabled={cooldown > 0}
              >
                Show Sensitivity
              </Button>

            </Paper>
            <Box
              component="footer"
              sx={{
                textAlign: 'center',
                py: 2,
                mt: 4,
                color: 'gray.400',
                fontSize: 14,
                backgroundColor: 'white',
                borderRadius: 26,
                boxShadow: 1,
                width: '349px',
                placeSelf: 'center',
                animation: 'fadeIn 1.2s ease-in',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                }
              }}

            >
              Developed by{' '}
              <Box
                component="a"
                href="https://www.instagram.com/mr._wink._?igsh=NDhycndvZTd3MXFs" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'darkblue', fontWeight: 600, textDecoration: 'underline', mx: 0.5 }}
              >
                Udayy
              </Box>
              [BETA] —
              <Box
                component="span"
                sx={{
                  color: 'orange',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  mx: 0.5,
                }}
                onClick={() => setGuideOpen(true)}
              >
                HD Fam
              </Box>
              © {new Date().getFullYear()}
            </Box>
          </Grid>

        </Grid>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" TransitionComponent={Transition}>
          <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
            Recommended Sensitivity
          </DialogTitle>

          <DialogContent sx={{ px: isMobile ? 2 : 4, py: 2 }}>
            {sensitivityData && (
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {Object.entries(sensitivityData).map(([key, value]) => (
                  <li key={key} style={{ marginBottom: '10px', listStyleType: 'decimal' }}>
                    <Typography variant="body1">
                      <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
                    </Typography>
                  </li>
                ))}
              </Box>
            )}

            <Typography
              variant="caption"
              color="error"
              sx={{ display: 'block', textAlign: 'center', fontWeight: 500 }}
            >
              * These sensitivity values are approximate. Train and fine-tune them to match your style.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              onClick={() => setOpen(false)}
              variant="contained"
              sx={{ fontWeight: 600 }}
              color="warning"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>



        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        {/* Footer */}


        {/* Guide Dialog */}
        <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
          <DialogTitle>Welcome to HD Fam</DialogTitle>
          <DialogContent dividers>

            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
              Connect with us:
            </Typography>

            <Box component="ul" sx={{ pl: 2, mb: 0, height: '200px', overflowY: 'auto' }}>
              {socialsData.links.map((link, index) => (
                <li key={index} style={{ marginBottom: 8, listStyleType: 'none', display: 'flex', alignItems: 'center' }}>
                  {getSocialIcon(link.icon)}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black', textDecoration: 'none' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setGuideOpen(false)} color="warning" variant='outlined'>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default App;
