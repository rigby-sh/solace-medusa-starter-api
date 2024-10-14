import { formatPrice } from '../../../utils/format-order';

interface EmailTemplateProps {
  data: any;
}

export const OrderPlacedEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ data }) => {
  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px',
        paddingTop: '36px',
        color: '#090909 !important',
        backgroundColor: '#F9F9F9',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px'
        }}
      >
        Your order #{data.order.display_id} has been placed!
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#090909 !important',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}
      >
        Thank you for shopping at <span style={{ fontWeight: '600' }}>SOLACE</span>. Your order has
        been received and is being processed.
      </p>
      <p
        style={{
          fontSize: '16px',
          color: '#090909 !important',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}
      >
        Details about your order are below.
      </p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid #ddd',
              fontSize: '15px !important'
            }}
          >
            <th
              style={{
                textAlign: 'left',
                padding: '10px'
              }}
            >
              Product
            </th>
            <th style={{ textAlign: 'left', padding: '10px' }} />
            <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '15px !important' }}>
          {data.order.items.map((item: any, index: number) => (
            <tr
              key={index}
              style={{ borderBottom: '1px solid #ddd' }}
            >
              <td style={{ padding: '10px' }}>
                <img
                  src={item.thumbnail}
                  alt={`Thumbnail of ${item.product_title}`}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover'
                  }}
                />
              </td>
              <td style={{ padding: '10px' }}>
                <p>{item.product_title}</p>
                <p>Variant: {item.variant_title}</p>
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '10px',
                  color: '#6C6C6C'
                }}
              >
                {formatPrice(item.unit_price, data.order.currency_code)}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '10px',
                  color: '#6C6C6C'
                }}
              >
                {item.quantity}
              </td>
              <td
                style={{
                  textAlign: 'right',
                  padding: '10px',
                  color: '#6C6C6C'
                }}
              >
                {formatPrice(item.unit_price * item.quantity, data.order.currency_code)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot style={{ fontSize: '15px !important' }}>
          <tr>
            <td
              colSpan={3}
              style={{
                textAlign: 'right',
                paddingTop: '15px',
                paddingBottom: '5px',
                paddingInline: '5px',
                fontWeight: '600'
              }}
            >
              Items:
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: 'right',
                paddingTop: '15px',
                paddingBottom: '5px',
                paddingInline: '5px',
                color: '#6C6C6C'
              }}
            >
              {formatPrice(data.order.item_total, data.order.currency_code)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={3}
              style={{
                textAlign: 'right',
                padding: '5px',
                fontWeight: '600'
              }}
            >
              Delivery:
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: 'right',
                padding: '5px',
                color: '#6C6C6C'
              }}
            >
              {formatPrice(data.order.shipping_methods[0].amount, data.order.currency_code)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={3}
              style={{
                textAlign: 'right',
                padding: '5px',
                fontWeight: '600'
              }}
            >
              Total:
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: 'right',
                padding: '5px',
                fontWeight: 'bold'
              }}
            >
              {formatPrice(data.order.total, data.order.currency_code)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div
        style={{
          marginBlock: '24px',
          fontSize: '15px !important'
        }}
      >
        <div>
          <p style={{ color: '#090909 !important' }}>
            <strong>Shipping address:</strong>
          </p>
          <p
            style={{
              color: '#6C6C6C !important',
              textDecoration: 'none !important'
            }}
          >
            {data.order.shipping_address.first_name} {data.order.shipping_address.last_name}
            ,<br />
            {data.order.shipping_address?.company ? `${data.order.shipping_address.company}, ` : ''}
            {data.order.shipping_address.address_1}
            {data.order.shipping_address.address_2}, {data.order.shipping_address.postal_code}{' '}
            {data.order.shipping_address.city}
            {data.order.shipping_address.province
              ? `, ${data.order.shipping_address.province}`
              : ''}
            <br />
            {data.order.email}, {data.order.shipping_address.phone}
          </p>
        </div>
        <div>
          <p style={{ color: '#090909 !important' }}>
            <strong>Delivery method:</strong>
          </p>
          <p style={{ color: '#6C6C6C' }}>{data.order.shipping_methods[0].name}</p>
        </div>
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#6C6C6C !important',
          textAlign: 'center',
          marginTop: '48px',
          marginBottom: '16px'
        }}
      >
        <p>
          Do you have any questions? Write to us{' '}
          <a
            href="mailto:solace@rigbydev.pl"
            style={{
              color: '#6C6C6C !important',
              textDecoration: 'none !important'
            }}
          >
            solace@rigbydev.pl
          </a>
        </p>
      </div>
    </div>
  );
};
