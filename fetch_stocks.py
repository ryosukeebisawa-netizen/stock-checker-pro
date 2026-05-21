import os
import requests
import json
import datetime

# J-Quantsから認証トークンを取得
def get_id_token(refresh_token):
    url = "https://api.jquants.com/v1/token/auth_refresh"
    params = {"refreshtoken": refresh_token}
    res = requests.post(url, params=params)
    return res.json()["idToken"]

# メイン処理
def main():
    refresh_token = os.environ.get("REFRESH_TOKEN")
    id_token = get_id_token(refresh_token)
    headers = {"Authorization": f"Bearer {id_token}"}
    
    # 本日の日付でデータを取得（ここから先は取得したデータを計算してjsonにする処理）
    today = datetime.date.today().strftime("%Y-%m-%d")
    print(f"Fetch data for {today}")
    
    # 簡易的に結果を保存（実際にはここに計算ロジックを入れる）
    data = {"lastUpdated": f"{datetime.datetime.now().strftime('%Y年%m月%d日 %H時%M分')}", "stocks": []}
    
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

if __name__ == "__main__":
    main()
