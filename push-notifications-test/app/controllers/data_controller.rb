class DataController < ApplicationController

  def save_subscription
    subscription = params[:subscription]
    Subscription.create(endpoint: subscription[:endpoint],
                        p256dh: subscription[:keys][:p256dh],
                        auth: subscription[:keys][:auth],
                        shop_id: 2895)
    return head(200)
  end

  def delete_subscription
    endpoint = params[:subscription][:endpoint]
    subscription = Subscription.find_by(endpoint: endpoint)
    subscription.destroy if subscription

    return head(200)
  end

  def product_created
    event_id, data, shop_id = params.values_at(:id, :data, :shop_id)
    webhook = Webhook.find_or_create_by(event_id: event_id)
    return head(200) if webhook.sent

    title = data[:title]
    image = data[:image][:src]
    url = "https://#{params[:shop_domain]}/products/#{data[:name]}"

    subscriptions = Subscription.where(shop_id: shop_id)

    subscriptions.each do |subscription|
      send_notification(subscription, title, image, url)
    end

    webhook.update(sent: true)
    return head(200)
  end

  def send_notification(subscription, title, image, url)
    endpoint = subscription[:endpoint]
    p256dh = subscription[:p256dh]
    auth = subscription[:auth]
    params = {endpoint: endpoint, p256dh: p256dh, auth: auth}

    client = WebpushClient.new
    response = client.send_notification(title, image, url, params)
    p response.body.inspect
  end


end





