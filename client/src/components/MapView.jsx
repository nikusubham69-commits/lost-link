import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapView = ({ items }) => {
    // items should have location field; for demo we just randomize coords
    // In a real app you'd geocode location names.

    const defaultPosition = [26.8467, 80.9462]; // generic location

    return (
        <MapContainer center={defaultPosition} zoom={15} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {items.map((item) => {
                // simple randomization for demo
                const lat = defaultPosition[0] + (Math.random() - 0.5) * 0.01;
                const lng = defaultPosition[1] + (Math.random() - 0.5) * 0.01;
                return (
                    <Marker key={item._id} position={[lat, lng]}>
                        <Popup>
                            <strong>{item.title}</strong><br/>{item.location || 'Unknown'}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default MapView;
