def unit_type(feature_array):
    # Takes the feature of one cell and returns what unit type it is
    for i in range(8):
        if feature_array[13 + i] == 1:
            return i

def is_valid_action(obs, action):
    """"
    obs is 1x16x16x27
    action is 1x9
    unit types (feature[13:21]) are: -, resources, base, barrack, worker, light, heavy, ranged
    action types (action[1]) are: -, move, harvest, return, produce, attack
    action parameters (action[2:5]) are: north, east, south, west
    """
    row = action[0] // 16
    col = action[0] % 16
    utype = unit_type(obs[0][row][col]) # Unit type
    atype = action[1] # Action it's attempting
    if utype == 0:
        return True
    elif utype == 1: # Resource
        if atype == 0:
            return True
        else:
            return False
    elif utype == 2: # Base
        if atype == 0:
            return True
        elif atype == 4:
            # Check to see if where it wants to produce is available
            if action[5] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[5] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[5] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[5] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        else:
            return False
    elif utype == 3: # Barrack
        if atype == 0:
            return True
        elif atype == 4: # If it's producing
            total_resources = 0 # How many resources Player 1 has
            for i in range(len(obs[0])):
                for j in range(len(obs[0][i])):
                    if obs[0][i][j][11] == 1 and obs[0][i][j][15] == 1:
                        for k in range(5):
                            if obs[0][i][j][5 + k] == 1:
                                total_resources = k
            # Check to see where it wants to produce is available
            if action[5] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0 and total_resources >= 2:
                return True
            elif action[5] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0 and total_resources >= 2:
                return True
            elif action[5] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0 and total_resources >= 2:
                return True
            elif action[5] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0 and total_resources >= 2:
                return True
            else:
                return False
        else:
            return False
    elif utype == 4: # Worker
        if atype == 0:
            return True
        elif atype == 1:
            if action[2] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[2] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[2] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[2] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        elif atype == 2:
            if action[3] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 1:
                return True
            elif action[3] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 1:
                return True
            elif action[3] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 1:
                return True
            elif action[3] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 1:
                return True
            else:
                return False
        elif atype == 3:
            if action[3] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 2:
                return True
            elif action[3] == 1 and 0 < col and 2 <= unit_type(obs[0][row][col + 1]) == 2:
                return True
            elif action[3] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 2:
                return True
            elif action[3] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 2:
                return True
            else:
                return False
        elif atype == 4:
            total_resources = 0
            for i in range(len(obs[0])):
                for j in range(len(obs[0][i])):
                    if obs[0][i][j][11] == 1 and obs[0][i][j][15] == 1:
                        for k in range(5):
                            if obs[0][i][j][5 + k] == 1:
                                total_resources = k
            if total_resources < 4:
                return False
            if action[5] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[5] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[5] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[5] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        elif atype == 5:
            return True
    elif utype == 5: # Light
        if atype == 0:
            return True
        elif atype == 1:
            if action[2] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[2] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[2] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[2] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        elif atype == 2:
            return False
        elif atype == 3:
            return False
        elif atype == 4:
            return False
        elif atype == 5:
            return True
    elif utype == 6: # Heavy
        if atype == 0:
            return True
        elif atype == 1:
            if action[2] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[2] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[2] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[2] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        elif atype == 2:
            return False
        elif atype == 3:
            return False
        elif atype == 4:
            return False
        elif atype == 5:
            return True
    elif utype == 7: # Ranged
        if atype == 0:
            return True
        elif atype == 1:
            if action[2] == 0 and 0 < row and unit_type(obs[0][row - 1][col]) == 0:
                return True
            elif action[2] == 1 and 0 < col and unit_type(obs[0][row][col + 1]) == 0:
                return True
            elif action[2] == 2 and row < 15 and unit_type(obs[0][row + 1][col]) == 0:
                return True
            elif action[2] == 3 and col < 15 and unit_type(obs[0][row][col - 1]) == 0:
                return True
            else:
                return False
        elif atype == 2:
            return False
        elif atype == 3:
            return False
        elif atype == 4:
            return False
        elif atype == 5:
            return True