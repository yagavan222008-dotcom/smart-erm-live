"""
Merge Sort Implementation for Patient Records and Educational Sorting.
Time Complexity: O(n log n) in all cases (best, average, worst).
Space Complexity: O(n).
Stability: Stable sort (preserves relative order of equal elements).
"""

from typing import List, Dict, Any, Callable


def merge_sort(
    arr: List[Dict[str, Any]],
    key: str = "arrival_seq",
    reverse: bool = False,
    trace_steps: bool = False
) -> Dict[str, Any]:
    """
    Sorts an array of dictionaries by the specified key using Divide and Conquer Merge Sort.
    If trace_steps is True, records split and merge stages for visual demonstration.
    """
    steps: List[str] = []

    def _merge(left: List[Dict[str, Any]], right: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            val_left = left[i].get(key, 0)
            val_right = right[j].get(key, 0)

            # Check comparison
            condition = (val_left <= val_right) if not reverse else (val_left >= val_right)
            if condition:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1

        result.extend(left[i:])
        result.extend(right[j:])

        if trace_steps:
            steps.append(f"Merged subarrays of size {len(left)} and {len(right)} -> result size {len(result)}")

        return result

    def _sort(sub: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(sub) <= 1:
            return sub

        mid = len(sub) // 2
        if trace_steps:
            steps.append(f"Dividing array of size {len(sub)} into halves ({mid} and {len(sub) - mid})")

        left_sorted = _sort(sub[:mid])
        right_sorted = _sort(sub[mid:])
        return _merge(left_sorted, right_sorted)

    sorted_array = _sort(list(arr))
    return {
        "sorted_items": sorted_array,
        "steps": steps,
        "algorithm": "Merge Sort",
        "time_complexity": "O(n log n)",
        "space_complexity": "O(n)",
        "stable": True
    }
