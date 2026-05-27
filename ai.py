import math
import time

def check_win_at(board, r, c, symbol):
    n = len(board)
    directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
    for dr, dc in directions:
        # Đếm các quân trùng khớp đi tới trước
        count_forward = 0
        rr, cc = r + dr, c + dc
        while 0 <= rr < n and 0 <= cc < n and board[rr][cc] == symbol:
            count_forward += 1
            rr += dr
            cc += dc
            
        # Đếm các quân trùng khớp đi lùi
        count_backward = 0
        rr, cc = r - dr, c - dc
        while 0 <= rr < n and 0 <= cc < n and board[rr][cc] == symbol:
            count_backward += 1
            rr -= dr
            cc -= dc
            
        total = 1 + count_forward + count_backward
        if total >= 5:
            # Kiểm tra xem có bị chặn hai đầu không
            lr = r - dr * (count_backward + 1)
            lc = c - dc * (count_backward + 1)
            left_block = not (0 <= lr < n and 0 <= lc < n) or board[lr][lc] != ''
            
            rr_end = r + dr * (count_forward + 1)
            cc_end = c + dc * (count_forward + 1)
            right_block = not (0 <= rr_end < n and 0 <= cc_end < n) or board[rr_end][cc_end] != ''
            
            if not (left_block and right_block):
                return True
    return False

def check_win(board, symbol):
    # Giữ hàm check_win cũ làm fallback hoặc quét toàn bộ khi cần thiết
    n = len(board)
    for r in range(n):
        for c in range(n):
            if board[r][c] == symbol:
                if check_win_at(board, r, c, symbol):
                    return True
    return False

def can_win_next(board, symbol):
    n = len(board)
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = symbol
                if check_win_at(board, r, c, symbol):
                    board[r][c] = ''
                    return True
                board[r][c] = ''
    return False

#================Minimax sẽ đánh giá nước đi đó tốt/xấu===========
def evaluate_board(board, ai_symbol, player_symbol):
    n = len(board)
    score = 0
    directions = [(0, 1), (1, 0), (1, 1), (1, -1)]
    
    # Tìm vùng bao của các quân đã đánh để giới hạn phạm vi quét
    min_r, max_r = n, -1
    min_c, max_c = n, -1
    has_stones = False
    for r in range(n):
        for c in range(n):
            if board[r][c] != '':
                has_stones = True
                if r < min_r: min_r = r
                if r > max_r: max_r = r
                if c < min_c: min_c = c
                if c > max_c: max_c = c
                
    if not has_stones:
        return 0
        
    # Thêm lề 2 ô xung quanh vùng đã chơi
    min_r = max(0, min_r - 2)
    max_r = min(n - 1, max_r + 2)
    min_c = max(0, min_c - 2)
    max_c = min(n - 1, max_c + 2)
    
    for r in range(min_r, max_r + 1):
        for c in range(min_c, max_c + 1):
            if board[r][c] == '':
                continue
            symbol = board[r][c]
            for dr, dc in directions:
                pr, pc = r - dr, c - dc
                if 0 <= pr < n and 0 <= pc < n and board[pr][pc] == symbol:
                    continue
                count = 0
                rr, cc = r, c
                while 0 <= rr < n and 0 <= cc < n and board[rr][cc] == symbol:
                    count += 1
                    rr += dr
                    cc += dc
                if count == 0:
                    continue
                left_block = False
                right_block = False
                lr, lc = r - dr, c - dc
                if not (0 <= lr < n and 0 <= lc < n) or board[lr][lc] != '':
                    left_block = True
                rr_end, cc_end = r + dr*count, c + dc*count
                if not (0 <= rr_end < n and 0 <= cc_end < n) or board[rr_end][cc_end] != '':
                    right_block = True
                blocked = left_block + right_block

                if symbol == ai_symbol:
                    if count >= 5 and blocked < 2:
                        return 1000000
                    if count == 4:
                        score += (50000 if blocked == 0 else 5000)
                    elif count == 3:
                        score += (1000 if blocked == 0 else 100)
                    elif count == 2:
                        score += (50 if blocked == 0 else 5)
                elif symbol == player_symbol:
                    if count >= 5 and blocked < 2:
                        return -1000000
                    if count == 4:
                        score -= (40000 if blocked == 0 else 4000)
                    elif count == 3:
                        score -= (800 if blocked == 0 else 80)
                    elif count == 2:
                        score -= (40 if blocked == 0 else 4)
    return score

def get_valid_moves(board, limit_radius=2):
    n = len(board)
    has_stone = any(board[r][c] != '' for r in range(n) for c in range(n))
    if not has_stone:
        return [(n//2, n//2)]
    neighbors = set()
    for r in range(n):
        for c in range(n):
            if board[r][c] != '':
                for dr in range(-limit_radius, limit_radius + 1):
                    for dc in range(-limit_radius, limit_radius + 1):
                        rr, cc = r + dr, c + dc
                        if 0 <= rr < n and 0 <= cc < n and board[rr][cc] == '':
                            neighbors.add((rr, cc))
    return list(neighbors)

def minimax(board, depth, alpha, beta, is_maximizing, ai_symbol, player_symbol, start_time, time_limit, last_r, last_c):
    if time.time() - start_time > time_limit:
        return evaluate_board(board, ai_symbol, player_symbol)

    if last_r >= 0 and last_c >= 0:
        if is_maximizing:  # Nước đi cuối cùng là của người chơi
            if check_win_at(board, last_r, last_c, player_symbol):
                return -100000
        else:  # Nước đi cuối cùng là của AI
            if check_win_at(board, last_r, last_c, ai_symbol):
                return 100000

    if depth == 0:
        return evaluate_board(board, ai_symbol, player_symbol)

    moves = get_valid_moves(board)
    if not moves:
        return 0

    # Sắp xếp các nước đi tiềm năng theo độ ưu tiên cận kề quân cờ đã đánh
    n = len(board)
    def move_score(move):
        r, c = move
        score = 0
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                rr, cc = r + dr, c + dc
                if 0 <= rr < n and 0 <= cc < n and board[rr][cc] != '':
                    score += 2
        for dr in [-2, -1, 0, 1, 2]:
            for dc in [-2, -1, 0, 1, 2]:
                if abs(dr) <= 1 and abs(dc) <= 1: continue
                rr, cc = r + dr, c + dc
                if 0 <= rr < n and 0 <= cc < n and board[rr][cc] != '':
                    score += 1
        return score

    moves.sort(key=move_score, reverse=True)
    # Giới hạn tối đa 8 nhánh tìm kiếm tốt nhất để tối ưu thời gian phản hồi
    moves = moves[:8]

    if is_maximizing:
        max_eval = -math.inf
        for (r, c) in moves:
            board[r][c] = ai_symbol
            eval = minimax(board, depth-1, alpha, beta, False, ai_symbol, player_symbol, start_time, time_limit, r, c)
            board[r][c] = ''
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = math.inf
        for (r, c) in moves:
            board[r][c] = player_symbol
            eval = minimax(board, depth-1, alpha, beta, True, ai_symbol, player_symbol, start_time, time_limit, r, c)
            board[r][c] = ''
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def get_ai_move(board, ai_symbol, player_symbol):
    n = len(board)
    start_time = time.time()
    time_limit = 0.8  # Giới hạn thời gian tối đa để đảm bảo mượt mà
    depth = 3  # Độ sâu 3 là hoàn hảo cho tốc độ phản hồi cực nhanh

    # 1. Nếu AI có nước đi thắng ngay lập tức
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = ai_symbol
                if check_win_at(board, r, c, ai_symbol):
                    board[r][c] = ''
                    return (r, c)
                board[r][c] = ''

    # 2. Nếu người chơi có nước đi thắng ở nước tiếp theo thì chặn
    for r in range(n):
        for c in range(n):
            if board[r][c] == '':
                board[r][c] = player_symbol
                if check_win_at(board, r, c, player_symbol):
                    board[r][c] = ''
                    return (r, c)
                board[r][c] = ''

    best_score = -math.inf
    best_move = None
    moves = get_valid_moves(board)

    # Sắp xếp các nước đi tiềm năng theo độ ưu tiên cận kề quân cờ đã đánh
    def move_score(move):
        r, c = move
        score = 0
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0: continue
                rr, cc = r + dr, c + dc
                if 0 <= rr < n and 0 <= cc < n and board[rr][cc] != '':
                    score += 2
        for dr in [-2, -1, 0, 1, 2]:
            for dc in [-2, -1, 0, 1, 2]:
                if abs(dr) <= 1 and abs(dc) <= 1: continue
                rr, cc = r + dr, c + dc
                if 0 <= rr < n and 0 <= cc < n and board[rr][cc] != '':
                    score += 1
        return score

    moves.sort(key=move_score, reverse=True)
    # Thử 12 nước đi tốt nhất ở cấp độ cao nhất
    moves = moves[:12]

    for (r, c) in moves:
        board[r][c] = ai_symbol
        score = minimax(board, depth, -math.inf, math.inf, False, ai_symbol, player_symbol, start_time, time_limit, r, c)
        board[r][c] = ''
        if score > best_score:
            best_score = score
            best_move = (r, c)

    if best_move is None:
        for r in range(n):
            for c in range(n):
                if board[r][c] == '':
                    return (r, c)
    return best_move