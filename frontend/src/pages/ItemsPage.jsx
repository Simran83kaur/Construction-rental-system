import plateImg from "../assets/images/shuttering-plate.jpeg";
import spotImg from "../assets/images/spot.jpeg";
import frameImg from "../assets/images/Scaffholding-frame.jpeg"; 
import durmatImg from "../assets/images/durmat.jpeg";
import cutterImg from "../assets/images/cutter-machine.webp";
import grinderImg from "../assets/images/grinder-machine.jpg"
import liftingImg from "../assets/images/lifting.webp"
import channelImg from "../assets/images/channel.webp"
import chaaliImg from "../assets/images/Chaali.webp"
import gadarImg from "../assets/images/Gadar.webp"
import kainchiImg from "../assets/images/kainchi.webp"
const items = [
  {
    name: "Shuttering Plate",
    price: 5,
    image: plateImg,
  },
  {
    name: "Spot",
    price: 2,
    image: spotImg,
  },
  {
    name: "Scaffolding Frame",
    price: 30,
    image: frameImg,
  },
  {
    name: "Durmat Machine",
    price: 500,
    image: durmatImg,
  },
  {
    name: "Cutter Machine",
    price: 100,
    image: cutterImg,
  },
  {
    name: "Grinder",
    price: 100,
    image: grinderImg,
  },
  {
    name: "Lifting Machine",
    price: 300,
    image: liftingImg,
  },
  {
    name: "Channel",
    price: 10,
    image: channelImg,
  },
  {
    name: "Chali",
    price: 10,
    image: chaaliImg,
  },
  {
    name: "Gadar",
    price: 5,
    image: gadarImg,
  },
  {
    name: "Kainchi",
    price: 0,
    image: kainchiImg,
  },

];

export default function ItemsPage({ isOwner }) {
  return (
    <section className="page">
      <div className="page-header">
        <h2>Items</h2>
        <p>{isOwner ? "Owner item list with prices." : "Owner Access Restricted"}</p>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>Item Name</th>
              {isOwner && <th>Price per Day</th>}
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.name}>
                <td>{index + 1}</td>

                <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      width="40"
                      height="40"
                      style={{ borderRadius: "5px" }}
                    />
                  )}
                  {item.name}
                </td>

                {isOwner && <td>Rs. {item.price}</td>}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </section>
  );
}
